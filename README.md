# Anonymous Adult Content Platform on Sui Blockchain

A decentralized, privacy-first adult content platform with streaming-only delivery and permanent access rights.

## 🚀 Quick Start (5 Minutes)

### Windows Users

1. **Install Dependencies:**
   ```bash
   install.bat
   ```

2. **Start Backend** (Terminal 1):
   ```bash
   start-backend.bat
   ```

3. **Start Frontend** (Terminal 2):
   ```bash
   start-frontend.bat
   ```

4. **Open Browser:**
   - Go to http://localhost:5173
   - Create account and start using!

### Manual Installation

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

See [QUICKSTART.md](QUICKSTART.md) for detailed usage guide.

## ✨ Key Features (MVP - COMPLETED)

✅ **Anonymous Authentication** - ZK Login simulation (no email/phone)
✅ **Content Upload** - Photos & videos with encryption
✅ **Free & PPV Content** - Flexible monetization
✅ **Permanent Access** - Buyers get lifetime access
✅ **Deletion Locks** - Can't delete content with paid viewers
✅ **Streaming Protection** - Watermarks, no downloads, DevTools detection
✅ **Tipping System** - Support creators directly
✅ **Creator Dashboard** - Upload, manage, track earnings
✅ **My Purchases** - Access all purchased content
✅ **Platform Fees** - Automatic 90/10 split

## 📁 Project Structure

```
├── contracts/          # Sui Move smart contracts
├── backend/           # Node.js API (Express + in-memory DB)
├── frontend/          # React + Redux + Tailwind CSS
├── docs/              # Documentation
├── install.bat        # One-click installer
├── start-backend.bat  # Start backend server
└── start-frontend.bat # Start frontend app
```

## 🎯 How It Works

### For Creators

1. **Sign Up** - Choose username, anonymous login
2. **Upload Content** - Photos/videos, set free or PPV
3. **Earn Money** - 90% of all sales and tips
4. **Track Performance** - Views, earnings, purchases
5. **Content Protection** - Can't delete if viewers paid

### For Viewers

1. **Browse Content** - Discover creators and content
2. **Purchase PPV** - One-time payment, permanent access
3. **Stream Securely** - Watermarked, no downloads
4. **Tip Creators** - Support your favorites
5. **My Purchases** - Access anytime, forever

## 🔒 Security Features

- **Content Protection:**
  - Streaming-only (no download buttons)
  - Dynamic watermarks (username + timestamp)
  - Right-click disabled
  - DevTools detection
  - Session-based access keys

- **Privacy:**
  - Anonymous usernames (no email/phone)
  - Wallet addresses hidden
  - ZK Login simulation

- **Business Logic:**
  - Deletion locks (protects paid viewers)
  - Permanent access rights
  - Transparent platform fees (10%)

## 🛠️ Tech Stack

- **Frontend:** React 18, Redux Toolkit, Tailwind CSS, Axios
- **Backend:** Node.js, Express, JWT, Multer
- **Storage:** In-memory (demo) → PostgreSQL + Walrus (production)
- **Blockchain:** Sui Move smart contracts (ready to deploy)

## 📊 Demo Features

Current implementation uses in-memory storage for quick demo:
- No database setup required
- Instant startup
- Perfect for testing and development

For production:
- Deploy smart contracts to Sui
- Connect PostgreSQL database
- Integrate Walrus storage
- Add Redis for sessions

## 🎮 Try It Out

1. **Create Creator Account:**
   - Username: `creator1`
   - Upload some content (free and PPV)

2. **Create Viewer Account:**
   - Username: `viewer1`
   - Browse and purchase content

3. **Test Features:**
   - Try to delete purchased content (locked!)
   - Send tips to creators
   - Check "My Purchases" page
   - View creator earnings dashboard

## 📈 Roadmap

### Phase 1 - MVP ✅ COMPLETE
- Anonymous authentication
- Content upload/streaming
- PPV with permanent access
- Deletion locks
- Tipping system
- Basic protection

### Phase 2 - Advanced Features
- Live streaming with WebRTC
- Premium tier (face filters, voice modulation)
- Subscription system
- Credit card payments (Stripe)
- Advanced DRM/EME

### Phase 3 - Scale
- Mobile apps (iOS/Android)
- NFT minting
- DAO governance
- Multi-language support
- Advanced analytics

## 🔧 Development

**Backend API Endpoints:**
- `POST /api/auth/zk-login` - Register/login
- `POST /api/content/upload` - Upload content
- `GET /api/content` - Browse content
- `POST /api/payment/purchase` - Buy PPV content
- `POST /api/payment/tip` - Send tip
- `POST /api/stream/session` - Create streaming session

**Frontend Routes:**
- `/` - Homepage (browse content)
- `/login` - Anonymous login
- `/dashboard` - Creator dashboard
- `/content/:id` - Content viewer
- `/purchases` - My purchases

## 📝 Documentation

- [QUICKSTART.md](QUICKSTART.md) - Detailed usage guide
- [docs/SETUP.md](docs/SETUP.md) - Production setup
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture
- [contracts/README.md](contracts/README.md) - Smart contracts
- [backend/README.md](backend/README.md) - Backend API
- [frontend/README.md](frontend/README.md) - Frontend app

## 🤝 Contributing

This is a demo/MVP implementation. For production deployment:
1. Deploy Sui smart contracts
2. Set up PostgreSQL database
3. Configure Walrus storage
4. Add Redis for caching
5. Implement real ZK Login
6. Security audit

## ⚠️ Important Notes

- **Demo Mode:** Uses in-memory storage (data lost on restart)
- **Simulated Blockchain:** No real Sui transactions
- **Test Only:** Not for production use without proper setup
- **Content Protection:** Demonstrates concepts, not foolproof

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for privacy-first content creators**
