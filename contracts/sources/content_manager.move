module platform::content_manager {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::vec_set::{Self, VecSet};
    use std::string::String;
    use sui::event;

    // Error codes
    const E_NOT_CREATOR: u64 = 1;
    const E_DELETION_LOCKED: u64 = 2;
    const E_INSUFFICIENT_PAYMENT: u64 = 3;
    const E_NO_ACCESS: u64 = 4;

    // Content types
    const TYPE_PHOTO: u8 = 0;
    const TYPE_VIDEO: u8 = 1;
    const TYPE_LIVE: u8 = 2;

    // Access types
    const ACCESS_FREE: u8 = 0;
    const ACCESS_PPV: u8 = 1;
    const ACCESS_SUBSCRIPTION: u8 = 2;

    const PLATFORM_FEE_PERCENT: u64 = 10;

    struct Content has key, store {
        id: UID,
        creator: address,
        walrus_blob_id: String,
        content_type: u8,
        access_type: u8,
        price: u64,
        paid_viewers: VecSet<address>,
        paid_viewer_count: u64,
        deletion_locked: bool,
        is_deleted: bool,
        created_at: u64,
        view_count: u64,
    }

    struct PlatformConfig has key {
        id: UID,
        platform_wallet: address,
        total_revenue: u64,
    }

    // Events
    struct ContentCreated has copy, drop {
        content_id: ID,
        creator: address,
        content_type: u8,
        access_type: u8,
        price: u64,
    }

    struct ContentPurchased has copy, drop {
        content_id: ID,
        buyer: address,
        amount: u64,
        timestamp: u64,
    }

    struct ContentDeleted has copy, drop {
        content_id: ID,
    }

    fun init(ctx: &mut TxContext) {
        let config = PlatformConfig {
            id: object::new(ctx),
            platform_wallet: tx_context::sender(ctx),
            total_revenue: 0,
        };
        transfer::share_object(config);
    }

    public entry fun create_content(
        walrus_blob_id: String,
        content_type: u8,
        access_type: u8,
        price: u64,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        let content = Content {
            id: object::new(ctx),
            creator,
            walrus_blob_id,
            content_type,
            access_type,
            price,
            paid_viewers: vec_set::empty(),
            paid_viewer_count: 0,
            deletion_locked: false,
            is_deleted: false,
            created_at: timestamp,
            view_count: 0,
        };

        let content_id = object::id(&content);
        
        event::emit(ContentCreated {
            content_id,
            creator,
            content_type,
            access_type,
            price,
        });

        transfer::share_object(content);
    }

    public entry fun purchase_content(
        content: &mut Content,
        payment: Coin<SUI>,
        config: &mut PlatformConfig,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        let payment_amount = coin::value(&payment);
        
        assert!(payment_amount >= content.price, E_INSUFFICIENT_PAYMENT);

        // Calculate platform fee (10%)
        let platform_fee = (content.price * PLATFORM_FEE_PERCENT) / 100;
        let creator_amount = content.price - platform_fee;

        // Split payment
        let platform_coin = coin::split(&mut payment, platform_fee, ctx);
        let creator_coin = coin::split(&mut payment, creator_amount, ctx);

        // Transfer to platform and creator
        transfer::public_transfer(platform_coin, config.platform_wallet);
        transfer::public_transfer(creator_coin, content.creator);
        
        // Return any excess
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, buyer);
        } else {
            coin::destroy_zero(payment);
        };

        // Grant permanent access
        vec_set::insert(&mut content.paid_viewers, buyer);
        content.paid_viewer_count = content.paid_viewer_count + 1;
        content.deletion_locked = true;

        config.total_revenue = config.total_revenue + platform_fee;

        event::emit(ContentPurchased {
            content_id: object::id(content),
            buyer,
            amount: content.price,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    public entry fun delete_content(
        content: &mut Content,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        assert!(content.creator == sender, E_NOT_CREATOR);
        assert!(!content.deletion_locked, E_DELETION_LOCKED);
        
        content.is_deleted = true;

        event::emit(ContentDeleted {
            content_id: object::id(content),
        });
    }

    public fun check_viewer_access(content: &Content, viewer: address): bool {
        if (content.access_type == ACCESS_FREE) {
            return true
        };
        
        vec_set::contains(&content.paid_viewers, &viewer)
    }

    public fun increment_view_count(content: &mut Content) {
        content.view_count = content.view_count + 1;
    }

    public fun get_walrus_blob_id(content: &Content): String {
        content.walrus_blob_id
    }

    public fun is_deletion_locked(content: &Content): bool {
        content.deletion_locked
    }

    public fun get_paid_viewer_count(content: &Content): u64 {
        content.paid_viewer_count
    }
}
