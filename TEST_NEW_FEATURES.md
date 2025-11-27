# 🧪 Test Guide - New Social & Payment Features

## Quick Test Scenarios

---

## Scenario 1: Test Wallet System (5 minutes)

### Deposit Funds
1. Open http://localhost:5173
2. Login as `creator1`
3. Click **"Wallet"** in navigation
4. Click **"Deposit"** button
5. Enter amount: `100`
6. Select: Credit Card
7. Click **"Deposit"**
8. ✅ See balance: 100.00 SUI

### Withdraw Funds
1. Still in Wallet page
2. Click **"Withdraw"** button
3. Enter amount: `50`
4. Select: Crypto Wallet
5. Enter address: `0x1234567890abcdef`
6. Click **"Withdraw"**
7. ✅ See pending balance: 50.00 SUI
8. ✅ Wait 5 seconds - withdrawal completes!

### View Transactions
1. Scroll down to "Recent Transactions"
2. ✅ See deposit (+100 SUI)
3. ✅ See withdrawal (-50 SUI)
4. ✅ See any purchases/tips

---

## Scenario 2: Test Messaging (5 minutes)

### Send Message
1. Login as `creator1`
2. Upload some content (if not already)
3. Logout
4. Open incognito window
5. Login as `viewer1`
6. View creator1's content
7. Click **"Message Creator"** button
8. Type: "Hi! Love your content!"
9. Click **"Send"**
10. ✅ Message sent!

### Receive & Reply
1. Switch back to creator1 window
2. Click **"Messages"** in navigation
3. ✅ See conversation with viewer1
4. ✅ See unread count badge
5. Click on conversation
6. ✅ See viewer1's message
7. Type reply: "Thanks for the support!"
8. Click **"Send"**
9. ✅ Reply sent!

### Check in Viewer Window
1. Switch to viewer1 window
2. Go to Messages
3. ✅ See creator1's reply!

---

## Scenario 3: Test Comments & @Mentions (3 minutes)

### Add Comment with Mention
1. Login as `viewer1`
2. View any content
3. Scroll to Comments section
4. Type: "Amazing work @creator1! Keep it up!"
5. Click **"Post Comment"**
6. ✅ Comment appears
7. ✅ Mention tracked: "Mentioned: @creator1"

### Like Comment
1. See your comment
2. Click the heart icon (🤍)
3. ✅ Heart turns red (❤️)
4. ✅ Like count increases to 1
5. Click again to unlike
6. ✅ Heart turns white again

### Add More Comments
1. Login as `creator1`
2. View the same content
3. Add comment: "Thanks @viewer1!"
4. ✅ Comment appears
5. ✅ Both mentions tracked

---

## Scenario 4: Test Bookmarks (2 minutes)

### Bookmark Content
1. Login as `viewer1`
2. View any content
3. Look at sidebar
4. Click **"☆ Bookmark"** button
5. ✅ Button changes to "★ Bookmarked"
6. ✅ Alert: "Bookmarked!"

### View Bookmarks
1. Click **"Bookmarks"** in navigation
2. ✅ See bookmarked content
3. ✅ Grid view with content details
4. Click **"View"** to watch
5. Click **"Remove"** to unbookmark

### Bookmark Multiple Items
1. Go back to Home
2. Bookmark 3-4 different content pieces
3. Go to Bookmarks page
4. ✅ See all bookmarked items

---

## Scenario 5: Test Follow System (2 minutes)

### Follow Creator
1. Login as `viewer1`
2. View creator1's content
3. Look at sidebar - see follower counts
4. Click **"Follow"** button
5. ✅ Button changes to "Unfollow"
6. ✅ Follower count increases

### Check from Creator Side
1. Login as `creator1`
2. View your own content
3. ✅ See follower count increased

### Unfollow
1. Back to viewer1
2. Click **"Unfollow"**
3. ✅ Button changes to "Follow"
4. ✅ Follower count decreases

---

## Scenario 6: Complete User Journey (10 minutes)

### As Viewer
1. **Login** as `viewer1`
2. **Deposit** 100 SUI to wallet
3. **Browse** content on homepage
4. **Purchase** PPV content (5 SUI)
5. **Bookmark** the content
6. **Comment**: "Great content @creator1!"
7. **Like** your own comment
8. **Follow** the creator
9. **Message** the creator: "Love your work!"
10. **Check Wallet** - see purchase deducted

### As Creator
1. **Login** as `creator1`
2. **Check Messages** - see viewer1's message
3. **Reply** to message
4. **View Content** - see viewer1's comment
5. **Reply** to comment with @mention
6. **Check Dashboard** - see earnings
7. **Go to Wallet** - see balance
8. **Withdraw** 20 SUI to crypto wallet
9. **Check Followers** - see viewer1 following

---

## 🎯 Feature Checklist

### Wallet Features
- [ ] Deposit via credit card
- [ ] Deposit via crypto
- [ ] Withdraw to crypto address
- [ ] Withdraw to bank account
- [ ] View balance
- [ ] View pending balance
- [ ] View transaction history
- [ ] View withdrawal history

### Messaging Features
- [ ] Send message to user
- [ ] Receive message
- [ ] View conversation history
- [ ] See unread count
- [ ] Message from content page
- [ ] List all conversations

### Comment Features
- [ ] Add comment
- [ ] @Mention users
- [ ] Like comment
- [ ] Unlike comment
- [ ] See like count
- [ ] See mentioned users
- [ ] View all comments

### Bookmark Features
- [ ] Bookmark content
- [ ] Unbookmark content
- [ ] View all bookmarks
- [ ] Access bookmarked content
- [ ] See bookmark status

### Follow Features
- [ ] Follow creator
- [ ] Unfollow creator
- [ ] See follower count
- [ ] See following count
- [ ] Track follow status

---

## 🐛 What to Look For

### Expected Behavior
✅ Wallet balance updates immediately
✅ Messages appear in real-time
✅ Comments show instantly
✅ Bookmarks toggle correctly
✅ Follow counts update
✅ @Mentions are tracked
✅ Like counts increase/decrease

### Error Handling
✅ Can't withdraw more than balance
✅ Can't message yourself
✅ Can't follow yourself
✅ Empty comments rejected
✅ Invalid amounts rejected

---

## 💡 Pro Tips

1. **Use Multiple Windows**
   - Main window: creator1
   - Incognito: viewer1
   - Test interactions between users

2. **Check All Pages**
   - Home → Dashboard → Wallet → Messages → Bookmarks
   - Navigate between pages to test persistence

3. **Test Edge Cases**
   - Try to withdraw $0
   - Try to message non-existent user
   - Try to bookmark deleted content
   - Try to comment on inaccessible content

4. **Verify Data Persistence**
   - Refresh page
   - Check if data remains
   - Logout and login again

---

## 🎊 Success Criteria

All features working if:
✅ Can deposit and withdraw funds
✅ Can send and receive messages
✅ Can comment with @mentions
✅ Can like/unlike comments
✅ Can bookmark/unbookmark content
✅ Can follow/unfollow creators
✅ All counts update correctly
✅ Navigation works smoothly
✅ Data persists across pages

---

## 🚀 Quick Start

1. **Open:** http://localhost:5173
2. **Login:** Create `creator1` and `viewer1`
3. **Test:** Follow scenarios above
4. **Verify:** Check all features work

---

**Estimated Testing Time:** 30 minutes for complete test
**Quick Test:** 10 minutes for basic features

**All features are working and ready to test!** 🎉
