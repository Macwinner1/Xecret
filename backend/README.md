# Backend API

Node.js backend for content streaming, authentication, and payment processing.

## Features

- RESTful API for content management
- HLS streaming with encryption
- Session-based access control
- Walrus storage integration
- PostgreSQL + Redis

## API Endpoints

### Authentication
- `POST /api/auth/zk-login` - ZK Login authentication
- `GET /api/auth/profile/:username` - Get user profile

### Content
- `POST /api/content/upload` - Upload content metadata
- `GET /api/content/:contentId` - Get content details
- `DELETE /api/content/:contentId` - Delete content (if allowed)
- `GET /api/content/:contentId/access` - Check viewer access

### Payment
- `POST /api/payment/purchase` - Purchase PPV content
- `POST /api/payment/tip` - Send tip to creator

### Streaming
- `POST /api/stream/session` - Generate session key
- `GET /api/stream/:contentId/stream.m3u8` - HLS playlist
- `POST /api/stream/violation` - Report protection violation

## Environment Variables

See `.env.example` for required configuration.

## Running

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## Database

Initialize schema:
```bash
psql -U postgres -d content_platform -f src/db/schema.sql
```
