import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, findUserByUsername, findUserByWallet } from '../db/mockDb.js';

const router = express.Router();

// Mock ZK Login - simulates OAuth + ZK proof
router.post('/zk-login', async (req, res) => {
  try {
    const { provider, username } = req.body;
    
    if (!username || username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }

    // Check if username exists
    const existingUser = findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Generate mock wallet address
    const wallet_address = '0x' + Math.random().toString(16).substr(2, 40);
    const user_id = uuidv4();

    // Create user
    const user = {
      username,
      wallet_address,
      account_type: 'free',
      subscription_status: 'inactive',
      is_verified: true, // Auto-verify for demo
      total_earnings: 0,
      total_tips_received: 0,
      deletion_requested: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
    };

    db.users.set(user_id, user);

    // Generate JWT token
    const token = jwt.sign(
      { user_id, username, wallet_address },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user_id,
      username,
      wallet_address,
      token,
      account_type: user.account_type,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login existing user
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    
    const user = findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, wallet_address: user.wallet_address },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user_id: user.user_id,
      username: user.username,
      wallet_address: user.wallet_address,
      token,
      account_type: user.account_type,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't expose wallet address publicly
    const { wallet_address, ...publicProfile } = user;

    res.json(publicProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user (from token)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = db.users.get(req.user.user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user_id: req.user.user_id,
      ...user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify JWT token
export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export default router;
