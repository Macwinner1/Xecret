import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/mockDb.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get wallet balance
router.get('/balance', verifyToken, async (req, res) => {
  try {
    let wallet = db.wallets.get(req.user.user_id);
    
    if (!wallet) {
      // Create wallet if doesn't exist
      wallet = {
        user_id: req.user.user_id,
        balance: 0,
        pending_balance: 0,
        created_at: new Date().toISOString(),
      };
      db.wallets.set(req.user.user_id, wallet);
    }

    res.json({
      balance: wallet.balance,
      pending_balance: wallet.pending_balance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deposit funds
router.post('/deposit', verifyToken, async (req, res) => {
  try {
    const { amount, payment_method, card_details, wallet_address } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!payment_method || !['credit_card', 'crypto'].includes(payment_method)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Get or create wallet
    let wallet = db.wallets.get(req.user.user_id);
    if (!wallet) {
      wallet = {
        user_id: req.user.user_id,
        balance: 0,
        pending_balance: 0,
        created_at: new Date().toISOString(),
      };
    }

    // Simulate payment processing
    const transaction_id = uuidv4();
    
    // Add to balance
    wallet.balance += amount;
    db.wallets.set(req.user.user_id, wallet);

    // Store deposit transaction for history
    if (!db.deposits) {
      db.deposits = new Map();
    }
    db.deposits.set(transaction_id, {
      user_id: req.user.user_id,
      type: 'deposit',
      amount,
      payment_method,
      status: 'completed',
      transaction_hash: payment_method === 'crypto' ? '0x' + Math.random().toString(16).substr(2, 64) : null,
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      transaction_id,
      new_balance: wallet.balance,
      message: `Successfully deposited ${amount} SUI`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request withdrawal
router.post('/withdraw', verifyToken, async (req, res) => {
  try {
    const { amount, withdrawal_method, crypto_address, bank_details } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!withdrawal_method || !['crypto', 'bank'].includes(withdrawal_method)) {
      return res.status(400).json({ error: 'Invalid withdrawal method' });
    }

    if (withdrawal_method === 'crypto' && !crypto_address) {
      return res.status(400).json({ error: 'Crypto address required' });
    }

    if (withdrawal_method === 'bank' && !bank_details) {
      return res.status(400).json({ error: 'Bank details required' });
    }

    // Get wallet
    const wallet = db.wallets.get(req.user.user_id);
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create withdrawal request
    const withdrawal_id = uuidv4();
    const withdrawal = {
      user_id: req.user.user_id,
      amount,
      withdrawal_method,
      crypto_address: withdrawal_method === 'crypto' ? crypto_address : null,
      bank_details: withdrawal_method === 'bank' ? bank_details : null,
      status: 'pending', // pending, processing, completed, failed
      created_at: new Date().toISOString(),
      processed_at: null,
    };

    db.withdrawals.set(withdrawal_id, withdrawal);

    // Deduct from balance and add to pending
    wallet.balance -= amount;
    wallet.pending_balance += amount;
    db.wallets.set(req.user.user_id, wallet);

    // Simulate processing (in production, this would be async)
    setTimeout(() => {
      withdrawal.status = 'completed';
      withdrawal.processed_at = new Date().toISOString();
      db.withdrawals.set(withdrawal_id, withdrawal);
      
      wallet.pending_balance -= amount;
      db.wallets.set(req.user.user_id, wallet);
    }, 5000); // 5 seconds for demo

    res.json({
      success: true,
      withdrawal_id,
      message: 'Withdrawal request submitted. Processing time: 1-3 business days',
      new_balance: wallet.balance,
      pending_balance: wallet.pending_balance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get withdrawal history
router.get('/withdrawals', verifyToken, async (req, res) => {
  try {
    const withdrawals = [];
    
    for (const [id, withdrawal] of db.withdrawals) {
      if (withdrawal.user_id === req.user.user_id) {
        withdrawals.push({
          ...withdrawal,
          withdrawal_id: id,
        });
      }
    }

    // Sort by date (newest first)
    withdrawals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel withdrawal request
router.post('/cancel-withdrawal', verifyToken, async (req, res) => {
  try {
    const { withdrawal_id } = req.body;

    const withdrawal = db.withdrawals.get(withdrawal_id);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    if (withdrawal.user_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending withdrawals' });
    }

    // Return amount to available balance
    const wallet = db.wallets.get(req.user.user_id);
    if (wallet) {
      wallet.balance += withdrawal.amount;
      wallet.pending_balance -= withdrawal.amount;
      db.wallets.set(req.user.user_id, wallet);
    }

    // Update withdrawal status
    withdrawal.status = 'cancelled';
    withdrawal.processed_at = new Date().toISOString();
    db.withdrawals.set(withdrawal_id, withdrawal);

    res.json({
      success: true,
      message: 'Withdrawal cancelled successfully',
      new_balance: wallet.balance,
      pending_balance: wallet.pending_balance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction history
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const transactions = [];

    // Get deposits (money added)
    if (db.deposits) {
      for (const [id, deposit] of db.deposits) {
        if (deposit.user_id === req.user.user_id) {
          transactions.push({
            type: 'deposit',
            amount: deposit.amount,
            description: `Deposit via ${deposit.payment_method === 'credit_card' ? 'Credit Card' : 'Crypto'}`,
            created_at: deposit.created_at,
          });
        }
      }
    }

    // Get purchases (money spent)
    for (const [id, purchase] of db.purchases) {
      if (purchase.buyer_id === req.user.user_id) {
        transactions.push({
          type: 'purchase',
          amount: -purchase.amount,
          description: 'Content purchase',
          created_at: purchase.purchased_at,
        });
      }
    }

    // Get tips sent (money spent)
    for (const [id, tip] of db.tips) {
      if (tip.from_user_id === req.user.user_id) {
        transactions.push({
          type: 'tip_sent',
          amount: -tip.amount,
          description: `Tip sent`,
          created_at: tip.created_at,
        });
      }
    }

    // Get tips received (money earned)
    for (const [id, tip] of db.tips) {
      if (tip.to_user_id === req.user.user_id) {
        const tipAmount = tip.amount * 0.9; // After platform fee
        transactions.push({
          type: 'tip_received',
          amount: tipAmount,
          description: `Tip received`,
          created_at: tip.created_at,
        });
      }
    }

    // Get earnings from content sales (money earned)
    for (const [id, purchase] of db.purchases) {
      const content = db.content.get(purchase.content_id);
      if (content && content.creator_id === req.user.user_id) {
        const saleAmount = purchase.amount * 0.9; // After platform fee
        transactions.push({
          type: 'sale',
          amount: saleAmount,
          description: 'Content sale',
          created_at: purchase.purchased_at,
        });
      }
    }

    // Get withdrawals (money withdrawn)
    for (const [id, withdrawal] of db.withdrawals) {
      if (withdrawal.user_id === req.user.user_id) {
        transactions.push({
          type: 'withdrawal',
          amount: -withdrawal.amount,
          description: `Withdrawal (${withdrawal.status})`,
          created_at: withdrawal.created_at,
        });
      }
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
