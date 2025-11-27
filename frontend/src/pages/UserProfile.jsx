import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { authAPI, contentAPI, socialAPI, messagingAPI } from '../api/client';

function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [contents, setContents] = useState([]);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [username, isAuthenticated]);

  const loadProfile = async () => {
    try {
      // Load user profile
      const profileResponse = await authAPI.getProfile(username);
      setProfile(profileResponse.data);

      // Load user's content
      const contentResponse = await contentAPI.getByCreator(username);
      setContents(contentResponse.data.contents);

      // Load follow stats
      const statsResponse = await socialAPI.getFollowStats(username);
      setFollowStats(statsResponse.data);

    } catch (error) {
      console.error('Failed to load profile:', error);
      if (error.response?.status === 404) {
        alert('User not found');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await socialAPI.followUser(username);
      setIsFollowing(response.data.action === 'followed');
      loadProfile();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to follow');
    }
  };

  const handleMessage = () => {
    navigate(`/messages?user=${username}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1419]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-[#1a1f2e] rounded-xl p-12 text-center border border-gray-800">
          <p className="text-gray-400 mb-4">User not found</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Timeline
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.username === username;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="bg-[#1a1f2e] rounded-xl p-6 mb-6 border border-gray-800">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">@{username}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                <span>{followStats.followers} followers</span>
                <span>{followStats.following} following</span>
                <span>{contents.length} posts</span>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex space-x-2">
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-full font-semibold ${
                  isFollowing
                    ? 'bg-[#0f1419] text-gray-400 hover:bg-gray-800'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button
                onClick={handleMessage}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold"
              >
                Message
              </button>
            </div>
          )}

          {isOwnProfile && (
            <Link
              to="/dashboard"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold"
            >
              Edit Profile
            </Link>
          )}
        </div>

        {profile.bio && (
          <p className="text-gray-300">{profile.bio}</p>
        )}
      </div>

      {/* User's Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Posts</h2>
        {contents.length > 0 ? (
          contents.map((post) => (
            <div
              key={post.content_id}
              className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">@{username}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
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
              </div>

              {/* Post Content Preview */}
              <div
                onClick={() => navigate(`/content/${post.content_id}`)}
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
                    onClick={() => navigate(`/content/${post.content_id}`)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <span className="text-xl">💬</span>
                    <span className="text-sm">Comment</span>
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {post.view_count} views
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#1a1f2e] rounded-xl p-12 text-center border border-gray-800">
            <p className="text-gray-400">No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
