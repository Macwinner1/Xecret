use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

pub fn register_user(
    ctx: Context<RegisterUser>,
    username: String,
) -> Result<()> {

    let user = &mut ctx.accounts.user;

    user.owner = *ctx.accounts.authority.key;
    user.username = username;
    user.is_premium = false;
    user.deletion_time = 0;

    Ok(())
}

#[derive(Accounts)]
pub struct RegisterUser<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + User::INIT_SPACE
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
