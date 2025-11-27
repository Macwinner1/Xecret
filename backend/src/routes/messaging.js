import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, findUserByUsername, getConversation, getUserConversations } from '../db/mockDb.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Send message
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { recipient_username, message_text } = req.body;

    if (!message_text || message_text.trim().length === 0) {
      return res.status(400).json({ error: 'Message text required' });
    }

    const recipient = findUserByUsername(recipient_username);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (recipient.user_id === req.user.user_id) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    const message_id = uuidv4();
    const message = {
      from_user_id: req.user.user_id,
      from_username: req.user.username,
      to_user_id: recipient.user_id,
      to_username: recipient.username,
      message_text,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    db.messages.set(message_id, message);

    res.json({
      success: true,
      message_id,
      message: { ...message, message_id },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation with user
router.get('/conversation/:username', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;

    const otherUser = findUserByUsername(username);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const messages = getConversation(req.user.user_id, otherUser.user_id);

    // Mark messages as read
    for (const message of messages) {
      if (message.to_user_id === req.user.user_id && !message.is_read) {
        const dbMessage = db.messages.get(message.message_id);
        if (dbMessage) {
          dbMessage.is_read = true;
          db.messages.set(message.message_id, dbMessage);
        }
      }
    }

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all conversations
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const conversations = getUserConversations(req.user.user_id);

    // Add unread count and other user info
    const conversationsWithDetails = conversations.map(conv => {
      const otherUserId = conv.from_user_id === req.user.user_id ? conv.to_user_id : conv.from_user_id;
      const otherUsername = conv.from_user_id === req.user.user_id ? conv.to_username : conv.from_username;

      // Count unread messages
      let unreadCount = 0;
      for (const [id, message] of db.messages) {
        if (message.to_user_id === req.user.user_id && 
            message.from_user_id === otherUserId && 
            !message.is_read) {
          unreadCount++;
        }
      }

      return {
        other_user_id: otherUserId,
        other_username: otherUsername,
        last_message: conv.message_text,
        last_message_time: conv.created_at,
        unread_count: unreadCount,
      };
    });

    res.json({ conversations: conversationsWithDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread message count
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    let unreadCount = 0;
    for (const [id, message] of db.messages) {
      if (message.to_user_id === req.user.user_id && !message.is_read) {
        unreadCount++;
      }
    }

    res.json({ unread_count: unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
