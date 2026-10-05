const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users
 * Lists all registered user accounts (Admin only).
 */
router.get('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.department, u.created_at,
             (SELECT COUNT(*) FROM ideas WHERE user_id = u.id) as ideas_count,
             (SELECT COUNT(*) FROM projects WHERE submitted_by = u.id) as projects_count
      FROM users u
      ORDER BY u.created_at DESC
    `).all();

    return res.json({ users });
  } catch (err) {
    console.error('Error listing users:', err);
    return res.status(500).json({ error: 'Failed to retrieve user accounts.' });
  }
});

/**
 * POST /api/users
 * Admin creates a new user account.
 */
router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'User full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (!role || !['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "student", "faculty", or "admin".' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check email uniqueness
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password with bcrypt
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const info = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, department)
      VALUES (?, ?, ?, ?, ?)
    `).run(name.trim(), cleanEmail, passwordHash, role, (department || '').trim());

    const newUser = db.prepare('SELECT id, name, email, role, department, created_at FROM users WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ message: 'User created successfully.', user: newUser });
  } catch (err) {
    console.error('Error creating user:', err);
    return res.status(500).json({ error: 'Failed to create user account.' });
  }
});

/**
 * PATCH /api/users/:id
 * Admin updates an existing user account role or department.
 */
router.patch('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role, department, name } = req.body;

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!existing) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const newRole = role && ['student', 'faculty', 'admin'].includes(role) ? role : existing.role;
    const newDept = department !== undefined ? department.trim() : existing.department;
    const newName = name && name.trim() ? name.trim() : existing.name;

    db.prepare(`
      UPDATE users SET name = ?, role = ?, department = ? WHERE id = ?
    `).run(newName, newRole, newDept, userId);

    const updated = db.prepare('SELECT id, name, email, role, department, created_at FROM users WHERE id = ?').get(userId);
    return res.json({ message: 'User updated successfully.', user: updated });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Failed to update user.' });
  }
});

/**
 * DELETE /api/users/:id
 * Admin deletes a user. (Prevent self-deletion).
 */
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!existing) {
      return res.status(404).json({ error: 'User not found.' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    return res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
});

module.exports = router;
