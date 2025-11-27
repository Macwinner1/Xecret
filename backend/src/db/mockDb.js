// Mock in-memory database for MVP demo
// Replace with actual PostgreSQL in production

export const db = {
  users: new Map(),
  content: new Map(),
  purchases: new Map(),
  tips: new Map(),
  sessions: new Map(),
  violations: new Map(),
};

// Helper functions
export const findUserByUsername = (username) => {
  for (const [id, user] of db.users) {
    if (user.username === username) {
      return { ...user, user_id: id };
    }
  }
  return null;
};

export const findUserByWallet = (wallet) => {
  for (const [id, user] of db.users) {
    if (user.wallet_address === wallet) {
      return { ...user, user_id: id };
    }
  }
  return null;
};

export const findContentById = (contentId) => {
  return db.content.get(contentId);
};

export const findContentByCreator = (creatorId) => {
  const contents = [];
  for (const [id, content] of db.content) {
    if (content.creator_id === creatorId) {
      contents.push({ ...content, content_id: id });
    }
  }
  return contents;
};

export const hasPurchased = (userId, contentId) => {
  for (const [id, purchase] of db.purchases) {
    if (purchase.buyer_id === userId && purchase.content_id === contentId) {
      return true;
    }
  }
  return false;
};

export const getAllContent = () => {
  const contents = [];
  for (const [id, content] of db.content) {
    if (!content.is_deleted && !content.is_hidden) {
      contents.push({ ...content, content_id: id });
    }
  }
  return contents;
};

export const getUserPurchases = (userId) => {
  const purchases = [];
  for (const [id, purchase] of db.purchases) {
    if (purchase.buyer_id === userId) {
      const content = db.content.get(purchase.content_id);
      if (content) {
        purchases.push({
          ...purchase,
          purchase_id: id,
          content: { ...content, content_id: purchase.content_id }
        });
      }
    }
  }
  return purchases;
};
