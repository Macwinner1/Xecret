import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import paymentRoutes from './routes/payment.js';
import streamingRoutes from './routes/streaming.js';
import socialRoutes from './routes/social.js';
import messagingRoutes from './routes/messaging.js';
import walletRoutes from './routes/wallet.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/stream', streamingRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messagingRoutes);
app.use('/api/wallet', walletRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Features: Auth, Content, Payment, Streaming, Social, Messaging, Wallet`);
});
