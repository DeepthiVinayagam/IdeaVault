const express = require('express');
const db = require('../../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/projects
 * List projects with optional search and department filters.
 * For students: Returns only approved projects.
 * For faculty/admin: Can filter by status (all, approved, pending, rejected).
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const { search, department, year, status } = req.query;

    let query = `
      SELECT p.*, 
             u1.name as submitter_name, 
             u2.name as approver_name
      FROM projects p
      LEFT JOIN users u1 ON p.submitted_by = u1.id
      LEFT JOIN users u2 ON p.approved_by = u2.id
      WHERE 1=1
    `;
    const params = [];

    // Students can ONLY view approved projects
    if (req.user.role === 'student') {
      query += ` AND p.status = 'approved'`;
    } else if (status && ['approved', 'pending', 'rejected'].includes(status)) {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    if (department && department.trim() !== '' && department !== 'All') {
      query += ` AND p.department = ?`;
      params.push(department.trim());
    }

    if (year && !isNaN(parseInt(year, 10))) {
      query += ` AND p.year = ?`;
      params.push(parseInt(year, 10));
    }

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (p.title LIKE ? OR p.abstract LIKE ? OR p.technologies LIKE ? OR p.student_names LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY p.year DESC, p.created_at DESC`;

    const projects = db.prepare(query).all(...params);
    return res.json({ projects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    return res.status(500).json({ error: 'Failed to retrieve projects.' });
  }
});

/**
 * GET /api/projects/:id
 * Get single project details.
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID.' });
    }

    const project = db.prepare(`
      SELECT p.*, 
             u1.name as submitter_name, 
             u2.name as approver_name
      FROM projects p
      LEFT JOIN users u1 ON p.submitted_by = u1.id
      LEFT JOIN users u2 ON p.approved_by = u2.id
      WHERE p.id = ?
    `).get(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Students can only view approved projects
    if (req.user.role === 'student' && project.status !== 'approved') {
      return res.status(403).json({ error: 'Access denied: Project is pending approval.' });
    }

    return res.json({ project });
  } catch (err) {
    console.error('Error fetching project detail:', err);
    return res.status(500).json({ error: 'Failed to retrieve project detail.' });
  }
});

/**
 * POST /api/projects
 * Add a completed project. Accessible only by faculty and admin.
 */
router.post('/', authenticateToken, requireRole('faculty', 'admin'), (req, res) => {
  try {
    const { title, abstract, technologies, department, year, student_names, status } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required.' });
    }
    if (!abstract || !abstract.trim()) {
      return res.status(400).json({ error: 'Abstract is required.' });
    }
    if (!technologies || !technologies.trim()) {
      return res.status(400).json({ error: 'Technologies list is required.' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ error: 'Department is required.' });
    }
    if (!year || isNaN(parseInt(year, 10))) {
      return res.status(400).json({ error: 'Valid completion year is required.' });
    }
    if (!student_names || !student_names.trim()) {
      return res.status(400).json({ error: 'Student author names are required.' });
    }

    const cleanTitle = title.trim();
    const cleanAbstract = abstract.trim();
    const cleanTech = technologies.trim();
    const cleanDept = department.trim();
    const cleanYear = parseInt(year, 10);
    const cleanStudents = student_names.trim();
    // Default project status is 'approved' if faculty adds it directly, or respects explicit status
    const projectStatus = status && ['approved', 'pending', 'rejected'].includes(status) ? status : 'approved';
    const approvedBy = projectStatus === 'approved' ? req.user.id : null;

    const info = db.prepare(`
      INSERT INTO projects (
        title, abstract, technologies, department, year, student_names, status, submitted_by, approved_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      cleanTitle,
      cleanAbstract,
      cleanTech,
      cleanDept,
      cleanYear,
      cleanStudents,
      projectStatus,
      req.user.id,
      approvedBy
    );

    const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (err) {
    console.error('Error creating project:', err);
    return res.status(500).json({ error: 'Failed to create project.' });
  }
});

/**
 * PATCH /api/projects/:id/status
 * Approve or reject a project. Strictly faculty and admin only.
 */
router.patch('/:id/status', authenticateToken, requireRole('faculty', 'admin'), (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const { status, review_notes } = req.body;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Valid status ("approved", "rejected", or "pending") is required.' });
    }

    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!existing) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const notes = review_notes !== undefined ? review_notes.trim() : existing.review_notes;
    const approvedBy = status === 'approved' ? req.user.id : (status === 'rejected' ? req.user.id : null);

    db.prepare(`
      UPDATE projects
      SET status = ?, review_notes = ?, approved_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, notes, approvedBy, projectId);

    const updated = db.prepare(`
      SELECT p.*, u.name as approver_name
      FROM projects p
      LEFT JOIN users u ON p.approved_by = u.id
      WHERE p.id = ?
    `).get(projectId);

    return res.json({ message: `Project marked as ${status}.`, project: updated });
  } catch (err) {
    console.error('Error updating project status:', err);
    return res.status(500).json({ error: 'Failed to update project status.' });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project. Only faculty or admin.
 */
router.delete('/:id', authenticateToken, requireRole('faculty', 'admin'), (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

    if (!existing) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
    return res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    console.error('Error deleting project:', err);
    return res.status(500).json({ error: 'Failed to delete project.' });
  }
});

module.exports = router;
