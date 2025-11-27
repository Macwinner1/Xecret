import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { contentAPI, socialAPI, paymentAPI } from '../api/client';

// Timeline Post Component with inline tipping
function TimelinePost({ post, onNavigate, onBookmark, currentUser }) {
  const [showTipForm, setShowTipForm] = useState(false);
  const [tipAmount, setTipAmount] = useState('');

  const handleSendTip = async (e) => {
    e.stopPropagation();
    if (!tipAmount || parseFloat(tipAmount) <= 0) {
      alert('Please enter a valid tip amount');
      return;
    }

    try {
      await paymentAPI.sendTip(post.creator_username, parseFloat(tipAmount), '', post.content_id);
      alert('Tip sent successfully!');
      setTipAmount('');
      setShowTipForm(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send tip');
    }
  };

  const isOwnPost = currentUser?.username === post.creator_username;

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
            {post.creator_username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">@{post.creator_username}</p>
            <p className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {post.access_type === 'ppv' && (
            <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
              {post.price} SUI
            </span>
          )}
          {post.access_type === 'free' && (
            <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
              FREE
            </span>
          )}
          {!isOwnPost && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTipForm(!showTipForm);
              }}
              className="px-4 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-sm rounded-full font-semibold"
            >
              💰 Tip
            </button>
          )}
        </div>
      </div>

      {/* Tip Form (if shown) */}
      {showTipForm && (
        <div className="px-4 pb-4">
          <div className="bg-[#0f1419] p-4 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-3">Send tip to @{post.creator_username}</p>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="Amount (SUI)"
                className="flex-1 px-3 py-2 bg-[#1a1f2e] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleSendTip}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold"
              >
                Send
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTipForm(false);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Content Preview */}
      <div
        onClick={() => onNavigate(`/content/${post.content_id}`)}
        className="cursor-pointer bg-[#0f1419] aspect-video flex items-center justify-center hover:bg-[#1a1f2e] transition-colors"
      >
        <div className="text-6xl">
          {post.content_type === 'photo' ? '📷' : '🎥'}
        </div>
      </div>

      {/* Post Actions */}
      <div className="p-4 flex items-center justify-between border-t border-gray-800">
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors">
            <span className="text-xl">❤️</span>
            <span className="text-sm">{post.tip_count || 0}</span>
          </button>
          <button
            onClick={() => onNavigate(`/content/${post.content_id}`)}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm">Comment</span>
          </button>
          <button
            onClick={() => onBookmark(post.content_id)}
            className="flex items-center space-x-2 text-gray-400 hover:text-yellow-500 transition-colors"
          >
            <span className="text-xl">🔖</span>
            <span className="text-sm">Save</span>
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {post.view_count} views
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postText, setPostText] = useState('');
  const [contentType, setContentType] = useState('photo');
  const [accessType, setAccessType] = useState('free');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadTimeline();
  }, [isAuthenticated]);

  const loadTimeline = async () => {
    try {
      const response = await contentAPI.getAll();
      setPosts(response.data.contents);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (accessType === 'ppv' && (!price || parseFloat(price) <= 0)) {
      alert('Please set a valid price');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('content_type', contentType);
      formData.append('access_type', accessType);
      formData.append('price', accessType === 'ppv' ? price : '0');

      await contentAPI.upload(formData);
      
      setShowCreatePost(false);
      setFile(null);
      setPostText('');
      setPrice('');
      loadTimeline();
    } catch (error) {
      alert(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLikePost = async (postId) => {
    // TODO: Implement post likes
    console.log('Like post:', postId);
  };

  const handleBookmark = async (postId) => {
    try {
      await socialAPI.toggleBookmark(postId);
      alert('Bookmark toggled!');
    } catch (error) {
      console.error('Failed to bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1419]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Create Post Card */}
      <div className="bg-[#1a1f2e] rounded-xl p-4 mb-4 border border-gray-800">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            {!showCreatePost ? (
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full text-left px-4 py-3 bg-[#0f1419] rounded-full text-gray-400 hover:bg-[#1a1f2e] transition-colors"
                >
                  What's on your mind, @{user?.username}?
                </button>
                <button
                  onClick={() => alert('Live streaming feature coming soon!')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-full text-white font-semibold flex items-center justify-center space-x-2 transition-all"
                >
                  <span className="text-xl">🔴</span>
                  <span>Go Live</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Share something..."
                  className="w-full px-4 py-3 bg-[#0f1419] rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setContentType('photo')}
                    className={`px-4 py-2 rounded-full text-sm ${
                      contentType === 'photo'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#0f1419] text-gray-400 hover:bg-[#1a1f2e]'
                    }`}
                  >
                    📷 Photo
                  </button>
                  <button
                    onClick={() => setContentType('video')}
                    className={`px-4 py-2 rounded-full text-sm ${
                      contentType === 'video'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#0f1419] text-gray-400 hover:bg-[#1a1f2e]'
                    }`}
                  >
                    🎥 Video
                  </button>
                  <button
                    onClick={() => setAccessType('free')}
                    className={`px-4 py-2 rounded-full text-sm ${
                      accessType === 'free'
                        ? 'bg-green-600 text-white'
                        : 'bg-[#0f1419] text-gray-400 hover:bg-[#1a1f2e]'
                    }`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => setAccessType('ppv')}
                    className={`px-4 py-2 rounded-full text-sm ${
                      accessType === 'ppv'
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#0f1419] text-gray-400 hover:bg-[#1a1f2e]'
                    }`}
                  >
                    💰 PPV
                  </button>
                </div>

                {accessType === 'ppv' && (
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price in SUI"
                    className="w-full px-4 py-2 bg-[#0f1419] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-[#0f1419] rounded-lg text-gray-400 hover:bg-[#1a1f2e] transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📎</span>
                  <span>{file ? file.name : 'Choose file'}</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={handleCreatePost}
                    disabled={uploading || !file}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Posting...' : 'Post'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreatePost(false);
                      setFile(null);
                      setPostText('');
                    }}
                    className="px-6 bg-[#0f1419] hover:bg-[#1a1f2e] text-gray-400 py-3 rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Posts */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <TimelinePost
              key={post.content_id}
              post={post}
              onNavigate={navigate}
              onBookmark={handleBookmark}
              currentUser={user}
            />
          ))
        ) : (
          <div className="bg-[#1a1f2e] rounded-xl p-12 text-center border border-gray-800">
            <p className="text-gray-400 mb-4">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
