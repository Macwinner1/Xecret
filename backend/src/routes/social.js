import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, findContentById, getCommentsByContent, findUserByUsername } from '../db/mockDb.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Add comment to content
router.post('/comments', verifyToken, async (req, res) => {
  try {
    const { content_id, comment_text } = req.body;

    if (!comment_text || comment_text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text required' });
    }

    const content = findContentById(content_id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const comment_id = uuidv4();
    const username = localStorage.getItem('username') || req.user.username;

    // Extract mentions (@username)
    const mentions = [];
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(comment_text)) !== null) {
      mentions.push(match[1]);
    }

    const comment = {
      content_id,
      user_id: req.user.user_id,
      username: req.user.username,
      comment_text,
      mentions,
      like_count: 0,
      is_deleted: false,
      created_at: new Date().toISOString(),
    };

    db.comments.set(comment_id, comment);

    res.json({
      success: true,
      comment_id,
      comment: { ...comment, comment_id },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comments for content
router.get('/comments/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const comments = getCommentsByContent(contentId);

    // Add like status if user is authenticated
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = null;
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user_id;
      } catch (e) {
        // Not authenticated, continue without like status
      }
    }

    const commentsWithLikes = comments.map(comment => {
      let isLiked = false;
      if (userId) {
        for (const [id, like] of db.likes) {
          if (like.comment_id === comment.comment_id && like.user_id === userId) {
            isLiked = true;
            break;
          }
        }
      }
      return { ...comment, is_liked: isLiked };
    });

    res.json({ comments: commentsWithLikes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like/unlike comment
router.post('/comments/:commentId/like', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = db.comments.get(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if already liked
    let likeId = null;
    for (const [id, like] of db.likes) {
      if (like.comment_id === commentId && like.user_id === req.user.user_id) {
        likeId = id;
        break;
      }
    }

    if (likeId) {
      // Unlike
      db.likes.delete(likeId);
      comment.like_count = Math.max(0, comment.like_count - 1);
      db.comments.set(commentId, comment);
      res.json({ success: true, action: 'unliked', like_count: comment.like_count });
    } else {
      // Like
      const newLikeId = uuidv4();
      db.likes.set(newLikeId, {
        comment_id: commentId,
        user_id: req.user.user_id,
        created_at: new Date().toISOString(),
      });
      comment.like_count += 1;
      db.comments.set(commentId, comment);
      res.json({ success: true, action: 'liked', like_count: comment.like_count });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete comment
router.delete('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = db.comments.get(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check ownership or content creator
    const content = findContentById(comment.content_id);
    if (comment.user_id !== req.user.user_id && content.creator_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    comment.is_deleted = true;
    db.comments.set(commentId, comment);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bookmark content
router.post('/bookmarks', verifyToken, async (req, res) => {
  try {
    const { content_id } = req.body;

    const content = findContentById(content_id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Check if already bookmarked
    let bookmarkId = null;
    for (const [id, bookmark] of db.bookmarks) {
      if (bookmark.user_id === req.user.user_id && bookmark.content_id === content_id) {
        bookmarkId = id;
        break;
      }
    }

    if (bookmarkId) {
      // Remove bookmark
      db.bookmarks.delete(bookmarkId);
      res.json({ success: true, action: 'removed' });
    } else {
      // Add bookmark
      const newBookmarkId = uuidv4();
      db.bookmarks.set(newBookmarkId, {
        user_id: req.user.user_id,
        content_id,
        created_at: new Date().toISOString(),
      });
      res.json({ success: true, action: 'added', bookmark_id: newBookmarkId });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's bookmarks
router.get('/bookmarks', verifyToken, async (req, res) => {
  try {
    const bookmarks = [];
    for (const [id, bookmark] of db.bookmarks) {
      if (bookmark.user_id === req.user.user_id) {
        const content = findContentById(bookmark.content_id);
        if (content && !content.is_deleted) {
          const { file_data, ...publicContent } = content;
          bookmarks.push({
            ...bookmark,
            bookmark_id: id,
            content: { ...publicContent, content_id: bookmark.content_id },
          });
        }
      }
    }

    res.json({ bookmarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow/unfollow user
router.post('/follow/:username', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;

    const userToFollow = findUserByUsername(username);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToFollow.user_id === req.user.user_id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if already following
    let followId = null;
    for (const [id, follow] of db.follows) {
      if (follow.follower_id === req.user.user_id && follow.following_id === userToFollow.user_id) {
        followId = id;
        break;
      }
    }

    if (followId) {
      // Unfollow
      db.follows.delete(followId);
      res.json({ success: true, action: 'unfollowed' });
    } else {
      // Follow
      const newFollowId = uuidv4();
      db.follows.set(newFollowId, {
        follower_id: req.user.user_id,
        following_id: userToFollow.user_id,
        created_at: new Date().toISOString(),
      });
      res.json({ success: true, action: 'followed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get followers/following
router.get('/follow/stats/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let followers = 0;
    let following = 0;

    for (const [id, follow] of db.follows) {
      if (follow.following_id === user.user_id) followers++;
      if (follow.follower_id === user.user_id) following++;
    }

    res.json({ followers, following });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
