module platform::monetization {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::string::String;
    use sui::event;

    const E_INVALID_AMOUNT: u64 = 1;
    const PLATFORM_FEE_PERCENT: u64 = 10;

    struct Tip has key, store {
        id: UID,
        from: address,
        to: address,
        amount: u64,
        message: String,
        timestamp: u64,
    }

    struct TipSent has copy, drop {
        tip_id: ID,
        from: address,
        to: address,
        amount: u64,
        timestamp: u64,
    }

    public entry fun send_tip(
        recipient: address,
        platform_wallet: address,
        payment: Coin<SUI>,
        message: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let amount = coin::value(&payment);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        assert!(amount > 0, E_INVALID_AMOUNT);

        // Calculate platform fee (10%)
        let platform_fee = (amount * PLATFORM_FEE_PERCENT) / 100;
        let recipient_amount = amount - platform_fee;

        // Split payment
        let platform_coin = coin::split(&mut payment, platform_fee, ctx);
        let recipient_coin = coin::split(&mut payment, recipient_amount, ctx);

        // Transfer
        transfer::public_transfer(platform_coin, platform_wallet);
        transfer::public_transfer(recipient_coin, recipient);
        coin::destroy_zero(payment);

        // Create tip record
        let tip = Tip {
            id: object::new(ctx),
            from: sender,
            to: recipient,
            amount,
            message,
            timestamp,
        };

        let tip_id = object::id(&tip);

        event::emit(TipSent {
            tip_id,
            from: sender,
            to: recipient,
            amount,
            timestamp,
        });

        transfer::transfer(tip, sender);
    }
}
