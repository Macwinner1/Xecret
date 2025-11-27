# Quick Start Guide

Get the platform running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Installation & Running

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Start Backend Server

```bash
npm start
```

Backend will run on http://localhost:3000

### 3. Install Frontend Dependencies (New Terminal)

```bash
cd frontend
npm install
```

### 4. Start Frontend

```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Using the Platform

### Create an Account

1. Open http://localhost:5173
2. Click "Sign In"
3. Enter a username (e.g., "creator1")
4. Click any OAuth button (simulated for demo)
5. You're logged in!

### Upload Content (Creator)

1. Go to "Creator Dashboard"
2. Fill in the upload form:
   - Content Type: Photo or Video
   - Access Type: Free or Pay-Per-View
   - Price: Set price if PPV (e.g., 5 SUI)
   - Upload File: Select an image or video
3. Click "Upload Content"
4. Your content appears in "My Content"

### View Content (Viewer)

1. Go to Home page
2. Click on any content card
3. If free: View immediately
4. If PPV: Click "Purchase Content" to buy
5. Content streams with watermark protection

### Test Features

**Content Protection:**
- Right-click is disabled on content
- Watermark shows your username
- DevTools detection alerts you

**Deletion Lock:**
- Upload PPV content
- Purchase it with another account
- Try to delete - you'll see it's locked!

**Permanent Access:**
- Purchase content
- Go to "My Purchases"
- Access anytime (even if creator deletes account)

**Tipping:**
- View any content
- Click "Send Tip" in sidebar
- Enter amount and optional message

## Demo Accounts

Create multiple accounts to test:
- `creator1` - Upload content
- `viewer1` - Purchase and view
- `viewer2` - Test tipping

## Features Working

✅ Anonymous registration (ZK Login simulation)
✅ Content upload (photos/videos)
✅ Free & Pay-Per-View content
✅ Purchase with permanent access
✅ Content deletion locks (can't delete if purchased)
✅ Streaming with watermarks
✅ DevTools detection
✅ Tipping system
✅ Creator earnings dashboard
✅ My Purchases page
✅ 10% platform fee auto-split

## Notes

- This is a demo using in-memory storage
- No actual blockchain transactions (simulated)
- Files stored in memory (lost on restart)
- For production: Add PostgreSQL, Redis, Sui blockchain, Walrus storage

## Troubleshooting

**Backend won't start:**
- Check if port 3000 is available
- Run `npm install` again

**Frontend won't start:**
- Check if port 5173 is available
- Run `npm install` again
- Clear browser cache

**Can't upload files:**
- Check file size (max 500MB)
- Ensure backend is running

## Next Steps

- Deploy smart contracts to Sui testnet
- Integrate real Walrus storage
- Add PostgreSQL database
- Implement real ZK Login
- Add Stripe for credit card payments
