import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { contentAPI, paymentAPI, streamingAPI, socialAPI, messagingAPI } from '../api/client';

function ContentViewer() {
  const { contentId } = useParams();
  const [content, setContent] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [watermark, setWatermark] = useState('');
  const [sessionKey, setSessionKey] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const [showTipForm, setShowTipForm] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadContent();
  }, [contentId, isAuthenticated]);

  useEffect(() => {
    // DevTools detection
    const detectDevTools = setInterval(() => {
      if (window.outerWidth - window.innerWidth > 200 || window.outerHeight - window.innerHeight > 200) {
        streamingAPI.reportViolation(contentId, 'devtools_detected');
        alert('Screen capture detected. Continued violations may result in suspension.');
      }
    }, 3000);

    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      clearInterval(detectDevTools);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [contentId]);

  const loadContent = async () => {
    try {
      // Get content details
      const contentResponse = await contentAPI.getById(contentId);
      setContent(contentResponse.data);

      // Check access
      const accessResponse = await contentAPI.checkAccess(contentId);
      setHasAccess(accessResponse.data.has_access);

      if (accessResponse.data.has_access) {
        // Create streaming session
        const sessionResponse = await streamingAPI.createSession(contentId);
        setSessionKey(sessionResponse.data.session_key);
        setWatermark(sessionResponse.data.watermark);
        
        // Get file URL
        const url = streamingAPI.getFileUrl(contentId, sessionResponse.data.session_key);
        setFileUrl(url);

        // Load comments
        loadComments();
      }

      // Load follow stats
      if (contentResponse.data.creator_username) {
        const statsResponse = await socialAPI.getFollowStats(contentResponse.data.creator_username);
        setFollowStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      alert('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await socialAPI.getComments(contentId);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await socialAPI.addComment(contentId, commentText);
      setCommentText('');
      loadComments();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await socialAPI.likeComment(commentId);
      loadComments();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const response = await socialAPI.toggleBookmark(contentId);
      setIsBookmarked(response.data.action === 'added');
      alert(response.data.action === 'added' ? 'Bookmarked!' : 'Bookmark removed');
    } catch (error) {
      alert('Failed to toggle bookmark');
    }
  };

  const handleMessageCreator = () => {
    navigate(`/messages?user=${content.creator_username}`);
  };

  const handleFollowCreator = async () => {
    try {
      const response = await socialAPI.followUser(content.creator_username);
      setIsFollowing(response.data.action === 'followed');
      // Reload stats
      const statsResponse = await socialAPI.getFollowStats(content.creator_username);
      setFollowStats(statsResponse.data);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to follow');
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await paymentAPI.purchase(contentId, 'sui');
      alert('Purchase successful! You now have permanent access.');
      loadContent(); // Reload to get access
    } catch (error) {
      alert(error.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSendTip = async () => {
    if (!tipAmount || parseFloat(tipAmount) <= 0) {
      alert('Please enter a valid tip amount');
      return;
    }

    try {
      await paymentAPI.sendTip(
        content.creator_username,
        parseFloat(tipAmount),
        tipMessage,
        contentId
      );
      alert('Tip sent successfully!');
      setTipAmount('');
      setTipMessage('');
      setShowTipForm(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send tip');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Content not found</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg max-w-md text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Premium Content</h2>
          <p className="text-gray-400 mb-6">
            This content requires payment to access.
          </p>
          <div className="mb-6">
            <p className="text-3xl font-bold mb-2">{content.price} SUI</p>
            <p className="text-sm text-gray-400">One-time payment, permanent access</p>
          </div>
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg mb-4 disabled:opacity-50"
          >
            {purchasing ? 'Processing...' : 'Purchase Content'}
          </button>
          <p className="text-xs text-gray-500 mb-4">
            No refunds. Content is protected and cannot be downloaded.
          </p>
          <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Warning banner */}
      <div className="bg-red-900/80 px-6 py-2 text-center">
        <p className="text-sm">
          ⚠️ Content is protected. Unauthorized recording may result in account suspension.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Timeline
          </Link>
        </div>

        {/* Content viewer */}
        <div className="mb-8">
          <div className="protected-content relative bg-[#1a1f2e] rounded-xl overflow-hidden border border-gray-800">
            {content.content_type === 'photo' ? (
              <img
                ref={imageRef}
                src={fileUrl}
                alt="Content"
                className="w-full h-auto"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
            ) : (
              <video
                ref={videoRef}
                src={fileUrl}
                controls
                controlsList="nodownload"
                className="w-full h-auto"
                onContextMenu={(e) => e.preventDefault()}
              >
                Your browser does not support video playback.
              </video>
            )}

            {/* Watermark overlay */}
            <div className="absolute bottom-4 right-4 text-white/50 text-xs pointer-events-none select-none">
              {watermark}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment... Use @username to mention someone"
              className="w-full px-4 py-3 bg-[#0f1419] rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
            <div className="mt-2 flex justify-between items-center">
              <p className="text-sm text-gray-400">
                Tip: Use @username to mention creators
              </p>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold"
              >
                Post Comment
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.comment_id} className="bg-[#0f1419] p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-blue-400">@{comment.username}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-gray-200 mb-3 whitespace-pre-wrap">{comment.comment_text}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeComment(comment.comment_id)}
                      className={`flex items-center gap-1 text-sm ${
                        comment.is_liked ? 'text-red-400' : 'text-gray-400'
                      } hover:text-red-400`}
                    >
                      {comment.is_liked ? '❤️' : '🤍'} {comment.like_count}
                    </button>
                    {comment.mentions && comment.mentions.length > 0 && (
                      <span className="text-xs text-gray-500">
                        Mentioned: {comment.mentions.map(m => `@${m}`).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentViewer;
