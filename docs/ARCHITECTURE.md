# System Architecture

## Overview

The platform consists of three main components:

1. **Smart Contracts (Sui Move)** - On-chain logic
2. **Backend API (Node.js)** - Off-chain services
3. **Frontend (React)** - User interface

## Data Flow

### Content Upload Flow
```
Creator → Frontend → Walrus (encrypted upload) → Backend API → Smart Contract
                                                      ↓
                                                  PostgreSQL
```

### Content Purchase Flow
```
Viewer → Frontend → Smart Contract (payment) → Backend (grant access)
                         ↓
                    Platform Fee Split (90/10)
```

### Content Streaming Flow
```
Viewer → Backend (verify access) → Walrus (fetch encrypted) → Decrypt → Stream (HLS)
```

## Security Layers

1. **Encryption**: AES-256 before upload
2. **Access Control**: Smart contract verification
3. **Session Keys**: 1-hour validity, IP-bound
4. **Watermarking**: Dynamic per-viewer
5. **DevTools Detection**: Client-side monitoring

## Smart Contract Architecture

### UserRegistry
- User registration with ZK Login
- Username → wallet mapping
- Account deletion (30-day grace)

### ContentManager
- Content metadata storage
- Deletion locks (paid viewers)
- Access control lists

### Monetization
- Tipping system
- PPV purchases
- Platform fee distribution

## Database Schema

See `backend/src/db/schema.sql` for complete schema.

Key tables:
- `users` - User profiles
- `content` - Content metadata
- `purchases` - Permanent access records
- `session_keys` - Streaming access tokens

## Content Protection

### Multi-Layer Approach
1. Canvas rendering (no right-click save)
2. EME/DRM for video
3. Dynamic watermarks
4. DevTools detection
5. Session-based keys
6. No direct blob URLs

### Limitations
- Cannot prevent external cameras
- Cannot prevent all screen capture
- Focus on deterrence + traceability
