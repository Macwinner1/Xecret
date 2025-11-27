# Frontend

React + TypeScript frontend with Tailwind CSS.

## Features

- ZK Login integration
- Content browsing and discovery
- Creator dashboard
- Protected content viewer with watermarks
- DevTools detection
- Responsive design

## Pages

- `/` - Homepage with trending content
- `/login` - Anonymous login with ZK proofs
- `/dashboard` - Creator dashboard (upload, analytics)
- `/content/:id` - Content viewer (streaming-only)

## Content Protection

- Canvas-based rendering (no right-click)
- Dynamic watermarks
- DevTools detection
- Session-based access

## Running

Development:
```bash
npm run dev
```

Build:
```bash
npm run build
```

## State Management

Redux Toolkit for:
- Authentication state
- Content state
- User preferences
