#!/bin/bash

# Deployment script for production

echo "Starting deployment..."

# Build smart contracts
echo "Building smart contracts..."
cd contracts
sui move build
sui client publish --gas-budget 100000000

# Build frontend
echo "Building frontend..."
cd ../frontend
npm install
npm run build

# Deploy backend
echo "Deploying backend..."
cd ../backend
npm install
pm2 start src/index.js --name content-platform-api

echo "Deployment complete!"
