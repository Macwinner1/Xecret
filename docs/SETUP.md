# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Sui CLI (for smart contract deployment)
- Walrus account (for decentralized storage)

## Smart Contracts Setup

1. Install Sui CLI:
```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui
```

2. Build contracts:
```bash
cd contracts
sui move build
```

3. Deploy to testnet:
```bash
sui client publish --gas-budget 100000000
```

4. Save package ID to `.env` files

## Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Setup database:
```bash
psql -U postgres -c "CREATE DATABASE content_platform;"
psql -U postgres -d content_platform -f src/db/schema.sql
```

4. Start Redis:
```bash
redis-server
```

5. Run backend:
```bash
npm run dev
```

## Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Access at http://localhost:5173

## Walrus Integration

1. Sign up at Walrus testnet
2. Get API credentials
3. Add to backend `.env`:
```
WALRUS_API_URL=https://...
WALRUS_API_KEY=your_key
```

## Testing

- Smart contracts: `sui move test`
- Backend: Create test files in `backend/tests/`
- Frontend: Access via browser

## Production Deployment

See `docs/DEPLOYMENT.md` for production setup instructions.
