import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { contentAPI } from '../api/client';

function HomePage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await contentAPI.getAll();
      setContents(response.data.contents);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = (contentId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/content/${contentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Anonymous Content Platform</h1>
          <p className="text-gray-400 mb-8">
            Privacy-first adult content platform on Sui blockchain
          </p>
          <div className="space-x-4">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login" 
                  className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link 
                to="/dashboard" 
                className="inline-block bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg"
              >
                Creator Dashboard
              </Link>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Full Anonymity</h3>
            <p className="text-gray-400">
              ZK Login ensures complete privacy. No email or phone required.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Content Protection</h3>
            <p className="text-gray-400">
              Streaming-only delivery with dynamic watermarks. No downloads.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Low Fees</h3>
            <p className="text-gray-400">
              Only 10% platform fee. Creators keep 90% of earnings.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">
            {contents.length > 0 ? 'Browse Content' : 'No Content Yet'}
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : contents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contents.map((content) => (
                <div
                  key={content.content_id}
                  onClick={() => handleContentClick(content.content_id)}
                  className="bg-gray-800 aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <div className="text-4xl mb-2">
                      {content.content_type === 'photo' ? '📷' : '🎥'}
                    </div>
                    <p className="text-sm text-gray-400 text-center mb-2">
                      by @{content.creator_username}
                    </p>
                    {content.access_type === 'ppv' && (
                      <div className="bg-blue-600 px-3 py-1 rounded-full text-xs">
                        {content.price} SUI
                      </div>
                    )}
                    {content.access_type === 'free' && (
                      <div className="bg-green-600 px-3 py-1 rounded-full text-xs">
                        FREE
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {content.view_count} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <p className="text-gray-400 mb-4">Be the first to upload content!</p>
              <Link 
                to="/login" 
                className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePage;
