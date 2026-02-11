use anchor_lang::prelude::*;

#[account]
pub struct User {
    pub owner: Pubkey,
    pub username: String,
    pub is_premium: bool,
    pub deletion_time: i64,
}

impl User {
    pub const INIT_SPACE: usize =
        32 +   // owner
            4 + 64 + // username
            1 +    // bool
            8;     // i64
}
