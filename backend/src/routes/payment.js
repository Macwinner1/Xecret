import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, findContentById, findUserByUsername, hasPurchased } from '../db/mockDb.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Purchase PPV content
router.post('/purchase', verifyToken, async (req, res) => {
  try {
    const { content_id, payment_method } = req.body;
    
    const content = findContentById(content_id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (content.access_type !== 'ppv') {
      return res.status(400).json({ error: 'Content is not pay-per-view' });
    }

    // Check if already purchased
    if (hasPurchased(req.user.user_id, content_id)) {
      return res.status(400).json({ error: 'Already purchased' });
    }

    // Simulate payment processing
    const purchase_id = uuidv4();
    const transaction_hash = '0x' + Math.random().toString(16).substr(2, 64);

    // Calculate platform fee (10%)
    const platform_fee = content.price * 0.10;
    const creator_amount = content.price - platform_fee;

    // Record purchase
    const purchase = {
      content_id,
      buyer_id: req.user.user_id,
      amount: content.price,
      payment_method,
      transaction_hash,
      purchased_at: new Date().toISOString(),
    };

    db.purchases.set(purchase_id, purchase);

    // Update content - lock deletion and increment paid viewer count
    content.paid_viewer_count += 1;
    content.deletion_locked = true;
    db.content.set(content_id, content);

    // Update creator earnings
    const creator = db.users.get(content.creator_id);
    if (creator) {
      creator.total_earnings += creator_amount;
      db.users.set(content.creator_id, creator);
    }

    // Add earnings to creator's wallet balance
    let creatorWallet = db.wallets.get(content.creator_id);
    if (!creatorWallet) {
      creatorWallet = {
        user_id: content.creator_id,
        balance: 0,
        pending_balance: 0,
        created_at: new Date().toISOString(),
      };
    }
    creatorWallet.balance += creator_amount;
    db.wallets.set(content.creator_id, creatorWallet);

    res.json({
      success: true,
      purchase_id,
      transaction_hash,
      amount: content.price,
      creator_amount,
      platform_fee,
      message: 'Purchase successful - you now have permanent access',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send tip
router.post('/tip', verifyToken, async (req, res) => {
  try {
    const { recipient_username, amount, message, content_id } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Find recipient
    const recipient = findUserByUsername(recipient_username);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Simulate payment
    const tip_id = uuidv4();
    const transaction_hash = '0x' + Math.random().toString(16).substr(2, 64);

    // Calculate platform fee (10%)
    const platform_fee = amount * 0.10;
    const recipient_amount = amount - platform_fee;

    // Record tip
    const tip = {
      from_user_id: req.user.user_id,
      to_user_id: recipient.user_id,
      content_id: content_id || null,
      amount,
      message: message || '',
      transaction_hash,
      created_at: new Date().toISOString(),
    };

    db.tips.set(tip_id, tip);

    // Update recipient earnings
    recipient.total_tips_received += recipient_amount;
    recipient.total_earnings += recipient_amount;
    db.users.set(recipient.user_id, recipient);

    // Add tip amount to recipient's wallet balance
    let recipientWallet = db.wallets.get(recipient.user_id);
    if (!recipientWallet) {
      recipientWallet = {
        user_id: recipient.user_id,
        balance: 0,
        pending_balance: 0,
        created_at: new Date().toISOString(),
      };
    }
    recipientWallet.balance += recipient_amount;
    db.wallets.set(recipient.user_id, recipientWallet);

    // Update content tip count if applicable
    if (content_id) {
      const content = findContentById(content_id);
      if (content) {
        content.tip_count += 1;
        db.content.set(content_id, content);
      }
    }

    res.json({
      success: true,
      tip_id,
      transaction_hash,
      amount,
      recipient_amount,
      platform_fee,
      message: 'Tip sent successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's purchases
router.get('/purchases', verifyToken, async (req, res) => {
  try {
    const purchases = [];
    
    for (const [id, purchase] of db.purchases) {
      if (purchase.buyer_id === req.user.user_id) {
        const content = findContentById(purchase.content_id);
        if (content && !content.is_deleted) {
          const { file_data, ...publicContent } = content;
          purchases.push({
            ...purchase,
            purchase_id: id,
            content: {
              ...publicContent,
              content_id: purchase.content_id,
            },
          });
        }
      }
    }

    res.json({ purchases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get creator's earnings
router.get('/earnings', verifyToken, async (req, res) => {
  try {
    const user = db.users.get(req.user.user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate breakdown
    const contentSales = [];
    for (const [id, purchase] of db.purchases) {
      const content = findContentById(purchase.content_id);
      if (content && content.creator_id === req.user.user_id) {
        contentSales.push({
          content_id: purchase.content_id,
          amount: purchase.amount * 0.9, // After platform fee
          purchased_at: purchase.purchased_at,
        });
      }
    }

    const tips = [];
    for (const [id, tip] of db.tips) {
      if (tip.to_user_id === req.user.user_id) {
        tips.push({
          tip_id: id,
          amount: tip.amount * 0.9, // After platform fee
          from_user: tip.from_user_id,
          message: tip.message,
          created_at: tip.created_at,
        });
      }
    }

    res.json({
      total_earnings: user.total_earnings,
      total_tips_received: user.total_tips_received,
      content_sales: contentSales,
      tips: tips,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
