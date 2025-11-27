import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, findContentById, hasPurchased } from '../db/mockDb.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Generate session key for streaming
router.post('/session', verifyToken, async (req, res) => {
  try {
    const { content_id } = req.body;
    
    const content = findContentById(content_id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Check access
    let hasAccess = false;
    if (content.access_type === 'free') {
      hasAccess = true;
    } else if (content.creator_id === req.user.user_id) {
      hasAccess = true;
    } else if (hasPurchased(req.user.user_id, content_id)) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied - purchase required' });
    }

    // Generate session key
    const session_id = uuidv4();
    const session_key = 'sk_' + Math.random().toString(36).substr(2, 32);
    const expires_at = new Date(Date.now() + 3600000); // 1 hour

    // Store session
    db.sessions.set(session_id, {
      user_id: req.user.user_id,
      username: req.user.username,
      content_id,
      session_key,
      expires_at: expires_at.toISOString(),
      ip_address: req.ip,
      created_at: new Date().toISOString(),
    });

    // Increment view count
    content.view_count += 1;
    db.content.set(content_id, content);

    res.json({
      session_key,
      session_id,
      expires_at: expires_at.toISOString(),
      watermark: `${req.user.username}_${Date.now()}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get content file (simulates streaming)
router.get('/:contentId/file', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { session_key } = req.query;

    if (!session_key) {
      return res.status(401).json({ error: 'Session key required' });
    }

    // Verify session key
    let validSession = null;
    for (const [id, session] of db.sessions) {
      if (session.session_key === session_key && session.content_id === contentId) {
        // Check expiry
        if (new Date(session.expires_at) > new Date()) {
          validSession = session;
          break;
        }
      }
    }

    if (!validSession) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const content = findContentById(contentId);
    if (!content || !content.file_data) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Return file data
    const buffer = Buffer.from(content.file_data, 'base64');
    res.setHeader('Content-Type', content.file_mimetype);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('X-Watermark', validSession.username);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report protection violation
router.post('/violation', verifyToken, async (req, res) => {
  try {
    const { content_id, violation_type } = req.body;
    
    const violation_id = uuidv4();
    
    db.violations.set(violation_id, {
      user_id: req.user.user_id,
      content_id,
      violation_type,
      detected_at: new Date().toISOString(),
    });

    // Count violations for this user
    let violationCount = 0;
    for (const [id, violation] of db.violations) {
      if (violation.user_id === req.user.user_id) {
        violationCount++;
      }
    }

    let warning = null;
    if (violationCount >= 5) {
      warning = 'Account suspended - too many violations';
    } else if (violationCount >= 3) {
      warning = 'Warning: Multiple violations detected. Next violation may result in suspension.';
    }

    res.json({
      success: true,
      violation_count: violationCount,
      warning,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Renew session (extend expiry)
router.post('/session/renew', verifyToken, async (req, res) => {
  try {
    const { session_key } = req.body;

    let session = null;
    let sessionId = null;
    for (const [id, s] of db.sessions) {
      if (s.session_key === session_key && s.user_id === req.user.user_id) {
        session = s;
        sessionId = id;
        break;
      }
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Extend expiry by 1 hour
    const new_expires_at = new Date(Date.now() + 3600000);
    session.expires_at = new_expires_at.toISOString();
    db.sessions.set(sessionId, session);

    res.json({
      success: true,
      expires_at: session.expires_at,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
