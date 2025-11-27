module platform::user_registry {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::String;
    use sui::event;

    // Error codes
    const E_USERNAME_TAKEN: u64 = 1;
    const E_NOT_VERIFIED: u64 = 2;
    const E_DELETION_NOT_READY: u64 = 3;
    const E_NO_DELETION_REQUEST: u64 = 4;

    // Account types
    const ACCOUNT_FREE: u8 = 0;
    const ACCOUNT_PREMIUM: u8 = 1;

    struct User has key, store {
        id: UID,
        username: String,
        wallet_address: address,
        account_type: u8,
        subscription_expiry: u64,
        is_verified: bool,
        total_earnings: u64,
        deletion_requested: bool,
        deletion_scheduled_date: u64,
        is_deleted: bool,
        created_at: u64,
    }

    struct UserRegistry has key {
        id: UID,
        user_count: u64,
    }

    // Events
    struct UserRegistered has copy, drop {
        user_id: ID,
        username: String,
        wallet_address: address,
        timestamp: u64,
    }

    struct AccountDeletionRequested has copy, drop {
        user_id: ID,
        scheduled_date: u64,
    }

    struct AccountDeleted has copy, drop {
        user_id: ID,
    }

    fun init(ctx: &mut TxContext) {
        let registry = UserRegistry {
            id: object::new(ctx),
            user_count: 0,
        };
        transfer::share_object(registry);
    }

    public entry fun register_user(
        username: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        let user = User {
            id: object::new(ctx),
            username,
            wallet_address: sender,
            account_type: ACCOUNT_FREE,
            subscription_expiry: 0,
            is_verified: false,
            total_earnings: 0,
            deletion_requested: false,
            deletion_scheduled_date: 0,
            is_deleted: false,
            created_at: timestamp,
        };

        let user_id = object::id(&user);
        
        event::emit(UserRegistered {
            user_id,
            username: user.username,
            wallet_address: sender,
            timestamp,
        });

        transfer::transfer(user, sender);
    }

    public entry fun verify_user(user: &mut User) {
        user.is_verified = true;
    }

    public entry fun upgrade_to_premium(
        user: &mut User,
        duration_days: u64,
        ctx: &mut TxContext
    ) {
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        user.account_type = ACCOUNT_PREMIUM;
        user.subscription_expiry = timestamp + (duration_days * 24 * 60 * 60 * 1000);
    }

    public entry fun request_account_deletion(
        user: &mut User,
        ctx: &mut TxContext
    ) {
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        let scheduled_date = timestamp + (30 * 24 * 60 * 60 * 1000); // 30 days
        
        user.deletion_requested = true;
        user.deletion_scheduled_date = scheduled_date;

        event::emit(AccountDeletionRequested {
            user_id: object::id(user),
            scheduled_date,
        });
    }

    public entry fun cancel_account_deletion(
        user: &mut User,
        ctx: &mut TxContext
    ) {
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        assert!(timestamp < user.deletion_scheduled_date, E_DELETION_NOT_READY);
        
        user.deletion_requested = false;
        user.deletion_scheduled_date = 0;
    }

    public fun is_premium(user: &User, ctx: &TxContext): bool {
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        user.account_type == ACCOUNT_PREMIUM && timestamp < user.subscription_expiry
    }

    public fun get_username(user: &User): String {
        user.username
    }

    public fun is_verified(user: &User): bool {
        user.is_verified
    }
}
