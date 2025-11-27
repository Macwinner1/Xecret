import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { db, findContentById, findContentByCreator, hasPurchased, getAllContent } from '../db/mockDb.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
});

// Upload content (simulates Walrus upload)
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { content_type, access_type, price } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Simulate Walrus blob upload
    const walrus_blob_id = 'walrus_' + uuidv4();
    const content_id = uuidv4();

    // Store content metadata
    const content = {
      creator_id: req.user.user_id,
      creator_username: req.user.username,
      walrus_blob_id,
      content_type,
      access_type,
      price: parseFloat(price) || 0,
      paid_viewer_count: 0,
      deletion_locked: false,
      is_deleted: false,
      is_hidden: false,
      view_count: 0,
      tip_count: 0,
      file_data: file.buffer.toString('base64'), // Store file data for demo
      file_mimetype: file.mimetype,
      created_at: new Date().toISOString(),
    };

    db.content.set(content_id, content);

    res.json({
      success: true,
      message: 'Content uploaded successfully',
      content_id,
      walrus_blob_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all content (public feed)
router.get('/', async (req, res) => {
  try {
    const contents = getAllContent();
    
    // Don't expose file data in list view
    const publicContents = contents.map(c => {
      const { file_data, ...publicContent } = c;
      return publicContent;
    });

    res.json({ contents: publicContents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get content details
router.get('/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = findContentById(contentId);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (content.is_deleted) {
      return res.status(404).json({ error: 'Content has been deleted' });
    }

    // Don't expose file data in details
    const { file_data, ...publicContent } = content;

    res.json({
      ...publicContent,
      content_id: contentId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get creator's content
router.get('/creator/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user
    let creatorId = null;
    for (const [id, user] of db.users) {
      if (user.username === username) {
        creatorId = id;
        break;
      }
    }

    if (!creatorId) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const contents = findContentByCreator(creatorId);
    
    // Don't expose file data
    const publicContents = contents.map(c => {
      const { file_data, ...publicContent } = c;
      return publicContent;
    });

    res.json({ contents: publicContents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete content
router.delete('/:contentId', verifyToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = findContentById(contentId);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Verify ownership
    if (content.creator_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check deletion lock
    if (content.deletion_locked) {
      return res.status(403).json({
        error: 'Cannot delete - viewers have purchased this content',
        paid_viewer_count: content.paid_viewer_count,
      });
    }

    // Mark as deleted
    content.is_deleted = true;
    db.content.set(contentId, content);

    res.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hide content from new viewers
router.post('/:contentId/hide', verifyToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = findContentById(contentId);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (content.creator_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    content.is_hidden = true;
    db.content.set(contentId, content);

    res.json({
      success: true,
      message: 'Content hidden from new viewers',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check viewer access
router.get('/:contentId/access', verifyToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = findContentById(contentId);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Free content
    if (content.access_type === 'free') {
      return res.json({ has_access: true, reason: 'free' });
    }

    // Creator always has access
    if (content.creator_id === req.user.user_id) {
      return res.json({ has_access: true, reason: 'creator' });
    }

    // Check if purchased
    const purchased = hasPurchased(req.user.user_id, contentId);
    
    res.json({
      has_access: purchased,
      reason: purchased ? 'purchased' : 'not_purchased',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
