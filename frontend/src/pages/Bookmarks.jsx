import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { socialAPI } from '../api/client';

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadBookmarks();
  }, [isAuthenticated]);

  const loadBookmarks = async () => {
    try {
      const response = await socialAPI.getBookmarks();
      setBookmarks(response.data.bookmarks);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (contentId) => {
    try {
      await socialAPI.toggleBookmark(contentId);
      loadBookmarks();
    } catch (error) {
      alert('Failed to remove bookmark');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.bookmark_id}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                <Link to={`/content/${bookmark.content_id}`}>
                  <div className="aspect-square flex items-center justify-center text-6xl bg-gray-700 hover:bg-gray-600 transition-colors">
                    {bookmark.content.content_type === 'photo' ? '📷' : '🎥'}
                  </div>
                </Link>
                <div className="p-3">
                  <p className="text-sm text-gray-400 mb-2">
                    by @{bookmark.content.creator_username}
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    {bookmark.content.access_type === 'free' ? (
                      <span className="text-xs bg-green-600 px-2 py-1 rounded">FREE</span>
                    ) : (
                      <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                        {bookmark.content.price} SUI
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Bookmarked: {new Date(bookmark.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to={`/content/${bookmark.content_id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs text-center"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => removeBookmark(bookmark.content_id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400 mb-4">No bookmarks yet</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
            >
              Browse Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookmarks;
