# 🎉 Demo Guide - Anonymous Content Platform

## ✅ System Status

**Backend:** Running on http://localhost:3000
**Frontend:** Running on http://localhost:5173

Both servers are up and ready to use!

## 🎮 Step-by-Step Demo

### Step 1: Create Your First Creator Account

1. Open http://localhost:5173 in your browser
2. Click **"Sign In"** button
3. Enter username: `creator1`
4. Click **"Continue with Google"** (simulated - no real OAuth)
5. You're now logged in as @creator1!

### Step 2: Upload Your First Content

1. Click **"Creator Dashboard"** in the navigation
2. Fill out the upload form:
   - **Content Type:** Photo
   - **Access Type:** Free
   - **Upload File:** Select any image from your computer
3. Click **"Upload Content"**
4. Success! Your content appears in "My Content" section

### Step 3: Upload Pay-Per-View Content

1. Still in Creator Dashboard
2. Upload another piece:
   - **Content Type:** Video (or Photo)
   - **Access Type:** Pay-Per-View
   - **Price:** 5 (SUI)
   - **Upload File:** Select a file
3. Click **"Upload Content"**
4. Notice the price tag on your PPV content

### Step 4: Create a Viewer Account

1. Click **"Logout"** in the top right
2. Click **"Sign In"** again
3. Enter username: `viewer1`
4. Click **"Continue with Facebook"**
5. You're now logged in as @viewer1!

### Step 5: Browse and View Free Content

1. Go to **Home** page
2. You'll see content from creator1
3. Click on the **FREE** content card
4. Content loads with:
   - ✅ Watermark showing your username
   - ✅ Right-click disabled
   - ✅ DevTools detection active
5. Try right-clicking - it's blocked!

### Step 6: Purchase PPV Content

1. Go back to Home
2. Click on the **PPV content** (5 SUI)
3. You'll see the purchase screen:
   - Price: 5 SUI
   - "One-time payment, permanent access"
4. Click **"Purchase Content"**
5. Success! Content unlocks immediately
6. Notice: "Permanent Access" badge

### Step 7: Test Content Protection

While viewing content:
1. Try to right-click → Blocked!
2. Open DevTools (F12) → Alert appears!
3. Check the watermark → Shows `viewer1_[timestamp]`
4. Try to download → No download option!

### Step 8: Send a Tip

1. While viewing content, look at the sidebar
2. Click **"Send Tip"**
3. Enter:
   - Amount: 2 (SUI)
   - Message: "Great content!"
4. Click **"Send"**
5. Success! Creator receives 90% (1.8 SUI)

### Step 9: Check Your Purchases

1. Click **"My Purchases"** in navigation
2. You'll see all content you've purchased
3. Click **"View Content"** on any item
4. Access anytime - it's permanent!

### Step 10: Test Deletion Lock (Important!)

1. Logout and login as `creator1` again
2. Go to **Creator Dashboard**
3. Find the PPV content that viewer1 purchased
4. Notice the **🔒 lock icon**
5. Click **"Delete"** button
6. Alert: "Cannot delete - 1 viewers have purchased this content"
7. **This is the key feature!** Protects viewer's permanent access

### Step 11: Check Creator Earnings

1. Still logged in as creator1
2. Look at the dashboard stats:
   - **Total Earnings:** Shows your revenue (90% of sales + tips)
   - **Total Views:** Number of views
   - **Content Pieces:** Number of uploads
3. All earnings are tracked automatically!

### Step 12: Delete Free Content

1. Find content with **no purchases** (0 purchases)
2. Click **"Delete"**
3. Confirm deletion
4. Success! Content deleted (no paid viewers)

## 🎯 Key Features Demonstrated

### ✅ Anonymous Authentication
- No email or phone required
- Username-only identity
- Simulated ZK Login

### ✅ Content Upload & Management
- Photos and videos supported
- Free or Pay-Per-View options
- Instant upload and processing

### ✅ Permanent Access Rights
- One-time purchase = lifetime access
- Buyers can access anytime
- Listed in "My Purchases"

### ✅ Deletion Locks
- Can't delete content with paid viewers
- Protects buyer's investment
- Lock icon shows protected content

### ✅ Content Protection
- Streaming-only (no downloads)
- Dynamic watermarks
- Right-click disabled
- DevTools detection

### ✅ Monetization
- Pay-per-view purchases
- Tipping system
- 90/10 revenue split
- Automatic fee calculation

### ✅ Creator Dashboard
- Upload management
- Earnings tracking
- View statistics
- Content deletion (when allowed)

## 🧪 Advanced Testing Scenarios

### Test Multiple Viewers

1. Create `viewer2` account
2. Purchase the same PPV content
3. Login as creator1
4. Try to delete → Now shows "2 viewers have purchased"
5. Deletion still blocked!

### Test Earnings Calculation

1. As creator1, note initial earnings
2. Have viewer1 purchase content for 5 SUI
3. Creator receives: 4.5 SUI (90%)
4. Platform keeps: 0.5 SUI (10%)
5. Check dashboard - earnings updated!

### Test Content Discovery

1. Create multiple creators (creator2, creator3)
2. Each uploads different content
3. Browse home page
4. All content appears in feed
5. Filter by creator username

### Test Session Management

1. Login as viewer1
2. Start viewing content
3. Watermark updates every few seconds
4. Session key valid for 1 hour
5. Auto-renewal while viewing

## 📊 What's Working

✅ User registration and login
✅ Content upload (photos/videos)
✅ Free content streaming
✅ PPV purchase flow
✅ Permanent access tracking
✅ Deletion locks (smart contract logic)
✅ Watermarking system
✅ Content protection (right-click, DevTools)
✅ Tipping system
✅ Creator earnings dashboard
✅ My Purchases page
✅ Platform fee calculation (10%)
✅ View count tracking
✅ Multi-user support

## 🔍 Technical Details

### Backend (Port 3000)
- Express.js REST API
- In-memory database (Map-based)
- JWT authentication
- File upload with Multer
- Session management

### Frontend (Port 5173)
- React 18 with Hooks
- Redux Toolkit for state
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling

### Data Flow
```
User → Frontend → API → In-Memory DB → Response
                    ↓
              File Storage (Base64)
```

## 🚀 Next Steps for Production

1. **Database:** Replace in-memory with PostgreSQL
2. **Blockchain:** Deploy Sui smart contracts
3. **Storage:** Integrate Walrus for files
4. **Authentication:** Implement real ZK Login
5. **Payments:** Add Stripe for credit cards
6. **Caching:** Add Redis for sessions
7. **Security:** Full security audit
8. **Scaling:** CDN, load balancing

## 💡 Tips & Tricks

- **Multiple Accounts:** Open incognito windows for different users
- **File Types:** Upload JPG, PNG, MP4, MOV files
- **File Size:** Max 500MB per file
- **Prices:** Use decimal values (e.g., 2.5 SUI)
- **Usernames:** 3-20 characters, alphanumeric + underscore

## 🐛 Troubleshooting

**Can't login?**
- Make sure backend is running (port 3000)
- Check browser console for errors

**Upload fails?**
- File might be too large (>500MB)
- Check file format (images/videos only)

**Content won't load?**
- Refresh the page
- Check if you're logged in
- Verify backend is running

**Purchase not working?**
- Make sure you're logged in
- Can't purchase your own content
- Can't purchase twice

## 🎊 Congratulations!

You've successfully tested the Anonymous Content Platform MVP!

All core features are working:
- Anonymous authentication ✅
- Content upload & streaming ✅
- PPV with permanent access ✅
- Deletion locks ✅
- Content protection ✅
- Tipping system ✅
- Creator earnings ✅

Ready for blockchain integration and production deployment!
