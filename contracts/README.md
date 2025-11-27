# Smart Contracts

Sui Move smart contracts for the anonymous content platform.

## Modules

### user_registry.move
- User registration with ZK Login
- Username management
- Premium tier upgrades
- Account deletion (30-day grace period)

### content_manager.move
- Content creation and metadata storage
- PPV purchase with permanent access
- Deletion locks (protects paid viewers)
- Access control verification

### monetization.move
- Tipping system
- Platform fee distribution (10%)

## Building

```bash
sui move build
```

## Testing

```bash
sui move test
```

## Deployment

```bash
sui client publish --gas-budget 100000000
```

Save the package ID for backend configuration.

## Key Features

- **Deletion Locks**: Content cannot be deleted if paid viewers exist
- **Permanent Access**: Buyers get lifetime access to purchased content
- **Platform Fee**: Automatic 90/10 split on all transactions
- **Event Emission**: All actions emit events for off-chain indexing
