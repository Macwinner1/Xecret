// Mock in-memory database for MVP demo
// Replace with actual PostgreSQL in production

export const db = {
  users: new Map(),
  content: new Map(),
  purchases: new Map(),
  tips: new Map(),
  sessions: new Map(),
  violations: new Map(),
  comments: new Map(),
  likes: new Map(),
  bookmarks: new Map(),
  messages: new Map(),
  wallets: new Map(),
  withdrawals: new Map(),
  follows: new Map(),
  deposits: new Map(),
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

export const getCommentsByContent = (contentId) => {
  const comments = [];
  for (const [id, comment] of db.comments) {
    if (comment.content_id === contentId && !comment.is_deleted) {
      comments.push({ ...comment, comment_id: id });
    }
  }
  return comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getUserBookmarks = (userId) => {
  const bookmarks = [];
  for (const [id, bookmark] of db.bookmarks) {
    if (bookmark.user_id === userId) {
      const content = db.content.get(bookmark.content_id);
      if (content && !content.is_deleted) {
        bookmarks.push({
          ...bookmark,
          bookmark_id: id,
          content: { ...content, content_id: bookmark.content_id }
        });
      }
    }
  }
  return bookmarks;
};

export const isBookmarked = (userId, contentId) => {
  for (const [id, bookmark] of db.bookmarks) {
    if (bookmark.user_id === userId && bookmark.content_id === contentId) {
      return true;
    }
  }
  return false;
};

export const getConversation = (user1Id, user2Id) => {
  const messages = [];
  for (const [id, message] of db.messages) {
    if (
      (message.from_user_id === user1Id && message.to_user_id === user2Id) ||
      (message.from_user_id === user2Id && message.to_user_id === user1Id)
    ) {
      messages.push({ ...message, message_id: id });
    }
  }
  return messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

export const getUserConversations = (userId) => {
  const conversations = new Map();
  for (const [id, message] of db.messages) {
    let otherUserId = null;
    if (message.from_user_id === userId) {
      otherUserId = message.to_user_id;
    } else if (message.to_user_id === userId) {
      otherUserId = message.from_user_id;
    }
    
    if (otherUserId) {
      if (!conversations.has(otherUserId) || 
          new Date(message.created_at) > new Date(conversations.get(otherUserId).created_at)) {
        conversations.set(otherUserId, { ...message, message_id: id });
      }
    }
  }
  return Array.from(conversations.values());
};

export const isFollowing = (followerId, followingId) => {
  for (const [id, follow] of db.follows) {
    if (follow.follower_id === followerId && follow.following_id === followingId) {
      return true;
    }
  }
  return false;
};
