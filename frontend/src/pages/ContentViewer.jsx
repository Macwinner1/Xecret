import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { contentAPI, paymentAPI, streamingAPI } from '../api/client';

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
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      alert('Failed to load content');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-black text-white">
      {/* Warning banner */}
      <div className="bg-red-900/80 px-6 py-2 text-center">
        <p className="text-sm">
          ⚠️ Content is protected. Unauthorized recording may result in account suspension.
        </p>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content viewer */}
          <div className="lg:col-span-2">
            <div className="protected-content relative bg-gray-900 rounded-lg overflow-hidden">
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator info */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Creator</h3>
              <p className="text-gray-400">@{content.creator_username}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-400">
                <p>{content.view_count} views</p>
                <p>{content.tip_count} tips received</p>
              </div>
            </div>

            {/* Tip creator */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Support Creator</h3>
              {!showTipForm ? (
                <button
                  onClick={() => setShowTipForm(true)}
                  className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg"
                >
                  Send Tip
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="Amount (SUI)"
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                  />
                  <textarea
                    value={tipMessage}
                    onChange={(e) => setTipMessage(e.target.value)}
                    placeholder="Optional message"
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    rows="3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendTip}
                      className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg"
                    >
                      Send
                    </button>
                    <button
                      onClick={() => setShowTipForm(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Content info */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Content Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span>{content.content_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Access:</span>
                  <span>{content.access_type === 'free' ? 'Free' : 'Pay-Per-View'}</span>
                </div>
                {content.access_type === 'ppv' && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span>{content.price} SUI</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Purchases:</span>
                  <span>{content.paid_viewer_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentViewer;
