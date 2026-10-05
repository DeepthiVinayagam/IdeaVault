const express = require('express');
const db = require('../../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { analyzeIdeaSimilarity } = require('../similarity');

const router = express.Router();

/**
 * GET /api/ideas
 * Lists all ideas for the logged-in student (or all ideas if admin).
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    let ideas;
    if (req.user.role === 'admin') {
      ideas = db.prepare(`
        SELECT i.*, u.name as student_name, u.email as student_email,
               a.id as analysis_id, a.overall_score, a.created_at as analyzed_at
        FROM ideas i
        JOIN users u ON i.user_id = u.id
        LEFT JOIN analyses a ON a.id = (
          SELECT id FROM analyses WHERE idea_id = i.id ORDER BY created_at DESC LIMIT 1
        )
        ORDER BY i.updated_at DESC
      `).all();
    } else {
      ideas = db.prepare(`
        SELECT i.*, 
               a.id as analysis_id, a.overall_score, a.created_at as analyzed_at
        FROM ideas i
        LEFT JOIN analyses a ON a.id = (
          SELECT id FROM analyses WHERE idea_id = i.id ORDER BY created_at DESC LIMIT 1
        )
        WHERE i.user_id = ?
        ORDER BY i.updated_at DESC
      `).all(req.user.id);
    }

    return res.json({ ideas });
  } catch (err) {
    console.error('Error fetching ideas:', err);
    return res.status(500).json({ error: 'Failed to retrieve ideas.' });
  }
});

/**
 * GET /api/ideas/:id
 * Get a specific idea by ID with its analysis history.
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const ideaId = parseInt(req.params.id, 10);
    if (isNaN(ideaId)) {
      return res.status(400).json({ error: 'Invalid idea ID.' });
    }

    const idea = db.prepare(`
      SELECT i.*, u.name as student_name, u.email as student_email
      FROM ideas i
      JOIN users u ON i.user_id = u.id
      WHERE i.id = ?
    `).get(ideaId);

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found.' });
    }

    // Role check: Students can only view their own ideas
    if (req.user.role === 'student' && idea.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You can only view your own ideas.' });
    }

    // Fetch the latest analysis for this idea
    const analysisRow = db.prepare(`
      SELECT * FROM analyses 
      WHERE idea_id = ? 
      ORDER BY created_at DESC LIMIT 1
    `).get(ideaId);

    let latestAnalysis = null;
    if (analysisRow) {
      latestAnalysis = {
        ...analysisRow,
        top_matches: JSON.parse(analysisRow.top_matches || '[]'),
        shared_keywords: JSON.parse(analysisRow.shared_keywords || '[]'),
        suggestions: JSON.parse(analysisRow.suggestions || '[]')
      };
    }

    return res.json({ idea, analysis: latestAnalysis });
  } catch (err) {
    console.error('Error fetching idea detail:', err);
    return res.status(500).json({ error: 'Failed to retrieve idea details.' });
  }
});

/**
 * POST /api/ideas/draft
 * Save an idea as a draft without running similarity analysis.
 */
router.post('/draft', authenticateToken, requireRole('student', 'admin'), (req, res) => {
  try {
    const { id, title, problem_statement, description, technologies } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project idea title is required to save a draft.' });
    }

    const cleanTitle = title.trim();
    const cleanProblem = (problem_statement || '').trim();
    const cleanDesc = (description || '').trim();
    const cleanTech = (technologies || '').trim();

    if (id) {
      // Update existing draft
      const existing = db.prepare('SELECT * FROM ideas WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Idea draft not found.' });
      }
      if (req.user.role === 'student' && existing.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied: Cannot edit another student\'s draft.' });
      }

      db.prepare(`
        UPDATE ideas 
        SET title = ?, problem_statement = ?, description = ?, technologies = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(cleanTitle, cleanProblem, cleanDesc, cleanTech, id);

      const updatedIdea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(id);
      return res.json({ message: 'Draft updated successfully', idea: updatedIdea });
    } else {
      // Insert new draft
      const info = db.prepare(`
        INSERT INTO ideas (user_id, title, problem_statement, description, technologies, status)
        VALUES (?, ?, ?, ?, ?, 'draft')
      `).run(req.user.id, cleanTitle, cleanProblem, cleanDesc, cleanTech);

      const newIdea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(info.lastInsertRowid);
      return res.status(201).json({ message: 'Draft saved successfully', idea: newIdea });
    }
  } catch (err) {
    console.error('Error saving idea draft:', err);
    return res.status(500).json({ error: 'Failed to save draft.' });
  }
});

/**
 * POST /api/ideas/analyze
 * Saves/updates an idea, runs similarity analysis against all approved projects,
 * stores the result in the database, and returns the detailed breakdown.
 */
router.post('/analyze', authenticateToken, requireRole('student', 'admin'), (req, res) => {
  try {
    const { id, title, problem_statement, description, technologies } = req.body;

    // Strict input validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required for analysis.' });
    }
    if (!problem_statement || !problem_statement.trim()) {
      return res.status(400).json({ error: 'Problem statement is required for analysis.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Project description is required for analysis.' });
    }
    if (!technologies || !technologies.trim()) {
      return res.status(400).json({ error: 'Technologies list is required for analysis.' });
    }

    const cleanTitle = title.trim();
    const cleanProblem = problem_statement.trim();
    const cleanDesc = description.trim();
    const cleanTech = technologies.trim();

    let ideaId = id ? parseInt(id, 10) : null;

    if (ideaId) {
      const existing = db.prepare('SELECT * FROM ideas WHERE id = ?').get(ideaId);
      if (!existing) {
        return res.status(404).json({ error: 'Idea not found.' });
      }
      if (req.user.role === 'student' && existing.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied: Cannot analyze another student\'s idea.' });
      }

      db.prepare(`
        UPDATE ideas 
        SET title = ?, problem_statement = ?, description = ?, technologies = ?, status = 'analyzed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(cleanTitle, cleanProblem, cleanDesc, cleanTech, ideaId);
    } else {
      const insertInfo = db.prepare(`
        INSERT INTO ideas (user_id, title, problem_statement, description, technologies, status)
        VALUES (?, ?, ?, ?, ?, 'analyzed')
      `).run(req.user.id, cleanTitle, cleanProblem, cleanDesc, cleanTech);
      ideaId = insertInfo.lastInsertRowid;
    }

    const savedIdea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(ideaId);

    // Fetch ONLY approved projects for comparison
    const approvedProjects = db.prepare(`
      SELECT * FROM projects 
      WHERE status = 'approved'
      ORDER BY id ASC
    `).all();

    // Run TF-IDF and Cosine similarity engine
    const analysisResult = analyzeIdeaSimilarity(savedIdea, approvedProjects);

    // Save analysis record to DB
    const insertAnalysis = db.prepare(`
      INSERT INTO analyses (
        idea_id, user_id, overall_score, top_matches, shared_keywords, suggestions, explanation
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      ideaId,
      req.user.id,
      analysisResult.overall_score,
      JSON.stringify(analysisResult.top_matches),
      JSON.stringify(analysisResult.shared_keywords),
      JSON.stringify(analysisResult.suggestions),
      analysisResult.explanation
    );

    const savedAnalysis = {
      id: insertAnalysis.lastInsertRowid,
      idea_id: ideaId,
      user_id: req.user.id,
      overall_score: analysisResult.overall_score,
      overall_percentage: analysisResult.overall_percentage,
      has_matches: analysisResult.has_matches,
      top_matches: analysisResult.top_matches,
      shared_keywords: analysisResult.shared_keywords,
      suggestions: analysisResult.suggestions,
      explanation: analysisResult.explanation,
      disclaimer: analysisResult.disclaimer,
      created_at: new Date().toISOString()
    };

    return res.json({
      message: 'Analysis completed successfully',
      idea: savedIdea,
      analysis: savedAnalysis
    });
  } catch (err) {
    console.error('Error analyzing idea:', err);
    return res.status(500).json({ error: 'Failed to run similarity analysis.' });
  }
});

/**
 * DELETE /api/ideas/:id
 * Deletes an idea and its analyses.
 */
router.delete('/:id', authenticateToken, requireRole('student', 'admin'), (req, res) => {
  try {
    const ideaId = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM ideas WHERE id = ?').get(ideaId);

    if (!existing) {
      return res.status(404).json({ error: 'Idea not found.' });
    }

    if (req.user.role === 'student' && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You can only delete your own ideas.' });
    }

    db.prepare('DELETE FROM ideas WHERE id = ?').run(ideaId);
    return res.json({ message: 'Idea deleted successfully.' });
  } catch (err) {
    console.error('Error deleting idea:', err);
    return res.status(500).json({ error: 'Failed to delete idea.' });
  }
});

module.exports = router;
