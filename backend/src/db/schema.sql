-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(20) UNIQUE NOT NULL,
    wallet_address VARCHAR(66) NOT NULL,
    encrypted_wallet TEXT NOT NULL,
    account_type VARCHAR(10) DEFAULT 'free',
    subscription_status VARCHAR(20) DEFAULT 'inactive',
    subscription_expiry TIMESTAMP,
    is_verified BOOLEAN DEFAULT false,
    total_earnings DECIMAL(20, 8) DEFAULT 0,
    total_tips_received DECIMAL(20, 8) DEFAULT 0,
    profile_picture_url TEXT,
    bio TEXT,
    deletion_requested BOOLEAN DEFAULT false,
    deletion_scheduled_date TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content table
CREATE TABLE content (
    content_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(user_id),
    walrus_blob_id TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL,
    access_type VARCHAR(20) NOT NULL,
    price DECIMAL(20, 8),
    paid_viewer_count INTEGER DEFAULT 0,
    deletion_locked BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    tip_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchases table (permanent access records)
CREATE TABLE purchases (
    purchase_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES content(content_id),
    buyer_id UUID REFERENCES users(user_id),
    amount DECIMAL(20, 8) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    transaction_hash TEXT,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tips table
CREATE TABLE tips (
    tip_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES users(user_id),
    to_user_id UUID REFERENCES users(user_id),
    content_id UUID REFERENCES content(content_id),
    amount DECIMAL(20, 8) NOT NULL,
    message TEXT,
    transaction_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session keys table (for streaming access)
CREATE TABLE session_keys (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    content_id UUID REFERENCES content(content_id),
    decryption_key TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Protection violations table
CREATE TABLE protection_violations (
    violation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    content_id UUID REFERENCES content(content_id),
    violation_type VARCHAR(50) NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_content_creator ON content(creator_id);
CREATE INDEX idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX idx_purchases_content ON purchases(content_id);
CREATE INDEX idx_session_keys_expires ON session_keys(expires_at);
