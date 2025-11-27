import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { paymentAPI } from '../api/client';

function CreatorDashboard() {
  const [earnings, setEarnings] = useState(null);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalContent: 0,
    totalTips: 0,
    totalSales: 0,
  });
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadEarnings();
  }, [isAuthenticated]);

  const loadEarnings = async () => {
    try {
      const response = await paymentAPI.getEarnings();
      setEarnings(response.data);
      
      // Calculate stats
      const totalTips = response.data.tips?.length || 0;
      const totalSales = response.data.content_sales?.length || 0;
      
      setStats({
        totalViews: 0, // TODO: Calculate from content
        totalContent: totalSales,
        totalTips,
        totalSales,
      });
    } catch (error) {
      console.error('Failed to load earnings:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Creator Dashboard</h1>
        <Link to="/" className="bg-[#1a1f2e] hover:bg-[#0f1419] px-4 py-2 rounded-lg text-gray-300">
          ← Back to Timeline
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Creator Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Creator Profile Card */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">@{user?.username}</h2>
                <p className="text-sm text-gray-400">Creator</p>
              </div>
            </div>

            {/* Follower Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0f1419] p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{stats.totalContent}</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div className="bg-[#0f1419] p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Link
                to={`/user/${user?.username}`}
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-semibold"
              >
                View Profile
              </Link>
              <Link
                to="/messages"
                className="w-full block text-center bg-green-600 hover:bg-green-700 py-2 rounded-lg text-white font-semibold"
              >
                Messages
              </Link>
              <Link
                to="/bookmarks"
                className="w-full block text-center bg-yellow-600 hover:bg-yellow-700 py-2 rounded-lg text-white font-semibold"
              >
                ☆ Bookmarks
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Views</span>
                <span className="text-white font-semibold">{stats.totalViews}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tips Received</span>
                <span className="text-white font-semibold">{stats.totalTips}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Content Sales</span>
                <span className="text-white font-semibold">{stats.totalSales}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl">
              <h3 className="text-gray-200 text-sm mb-2">Total Earnings</h3>
              <p className="text-3xl font-bold text-white">
                {earnings ? earnings.total_earnings.toFixed(2) : '0.00'} SUI
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl">
              <h3 className="text-gray-200 text-sm mb-2">Tips Received</h3>
              <p className="text-3xl font-bold text-white">{stats.totalTips}</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl">
              <h3 className="text-gray-200 text-sm mb-2">Content Sales</h3>
              <p className="text-3xl font-bold text-white">{stats.totalSales}</p>
            </div>
            <div className="bg-gradient-to-br from-pink-600 to-pink-800 p-6 rounded-xl">
              <h3 className="text-gray-200 text-sm mb-2">Total Tips (SUI)</h3>
              <p className="text-3xl font-bold text-white">
                {earnings ? earnings.total_tips_received.toFixed(2) : '0.00'}
              </p>
            </div>
          </div>

          {/* Recent Tips */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Recent Tips</h2>
            {earnings && earnings.tips && earnings.tips.length > 0 ? (
              <div className="space-y-3">
                {earnings.tips.slice(0, 5).map((tip, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-[#0f1419] rounded-lg">
                    <div>
                      <p className="text-white font-medium">Tip received</p>
                      <p className="text-sm text-gray-400">
                        {new Date(tip.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-green-400 font-bold">+{tip.amount.toFixed(2)} SUI</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No tips received yet</p>
            )}
          </div>

          {/* Recent Sales */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Recent Content Sales</h2>
            {earnings && earnings.content_sales && earnings.content_sales.length > 0 ? (
              <div className="space-y-3">
                {earnings.content_sales.slice(0, 5).map((sale, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-[#0f1419] rounded-lg">
                    <div>
                      <p className="text-white font-medium">Content purchased</p>
                      <p className="text-sm text-gray-400">
                        {new Date(sale.purchased_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-blue-400 font-bold">+{sale.amount.toFixed(2)} SUI</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No sales yet</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/wallet"
              className="bg-[#1a1f2e] hover:bg-[#0f1419] p-6 rounded-xl text-center border border-gray-800 transition-colors"
            >
              <div className="text-4xl mb-2">💰</div>
              <p className="text-white font-semibold">Manage Wallet</p>
              <p className="text-sm text-gray-400">Withdraw earnings</p>
            </Link>
            <Link
              to="/"
              className="bg-[#1a1f2e] hover:bg-[#0f1419] p-6 rounded-xl text-center border border-gray-800 transition-colors"
            >
              <div className="text-4xl mb-2">📝</div>
              <p className="text-white font-semibold">Create Post</p>
              <p className="text-sm text-gray-400">Share new content</p>
            </Link>
            <Link
              to="/messages"
              className="bg-[#1a1f2e] hover:bg-[#0f1419] p-6 rounded-xl text-center border border-gray-800 transition-colors"
            >
              <div className="text-4xl mb-2">💬</div>
              <p className="text-white font-semibold">Messages</p>
              <p className="text-sm text-gray-400">Chat with fans</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatorDashboard;
