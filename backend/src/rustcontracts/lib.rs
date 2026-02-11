use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;



#[program]
pub mod anonymous_platform {
    use super::*;

    pub fn register_user(
        ctx: Context<RegisterUser>,
        username: String,
    ) -> Result<()> {
        instructions::register_user(ctx, username)
    }

    pub fn create_content(
        ctx: Context<CreateContent>,
        metadata: String,
        price: u64,
    ) -> Result<()> {
        instructions::create_content(ctx, metadata, price)
    }
}
