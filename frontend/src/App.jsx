import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { logout } from './store/authSlice';
import HomePage from './pages/HomePage';
import CreatorDashboard from './pages/CreatorDashboard';
import ContentViewer from './pages/ContentViewer';
import Login from './pages/Login';
import MyPurchases from './pages/MyPurchases';
import Wallet from './pages/Wallet';
import Messages from './pages/Messages';
import Bookmarks from './pages/Bookmarks';
import UserProfile from './pages/UserProfile';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const username = searchQuery.replace('@', '').trim();
      // Navigate to user profile or search results
      navigate(`/user/${username}`);
      setSearchQuery('');
    }
  };

  if (!isAuthenticated && location.pathname !== '/login') {
    return <Login />;
  }

  if (location.pathname === '/login') {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-[#1a1f2e] border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                XSecret
              </h1>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users @username..."
                  className="w-full px-4 py-2 pl-10 bg-[#0f1419] rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className={`p-2 rounded-full hover:bg-[#0f1419] ${location.pathname === '/' ? 'text-blue-500' : 'text-gray-400'}`}
                title="Home"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/messages')}
                className={`p-2 rounded-full hover:bg-[#0f1419] ${location.pathname === '/messages' ? 'text-blue-500' : 'text-gray-400'}`}
                title="Messages"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/wallet')}
                className={`p-2 rounded-full hover:bg-[#0f1419] ${location.pathname === '/wallet' ? 'text-blue-500' : 'text-gray-400'}`}
                title="Wallet"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-[#0f1419]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1f2e] rounded-lg shadow-lg border border-gray-800 py-2">
                    <div className="px-4 py-2 border-b border-gray-800">
                      <p className="text-sm font-semibold">@{user?.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#0f1419] text-gray-300"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/purchases');
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#0f1419] text-gray-300"
                    >
                      My Purchases
                    </button>
                    <button
                      onClick={() => {
                        navigate('/bookmarks');
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#0f1419] text-gray-300"
                    >
                      Bookmarks
                    </button>
                    <div className="border-t border-gray-800 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-[#0f1419] text-red-400"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<CreatorDashboard />} />
          <Route path="/content/:contentId" element={<ContentViewer />} />
          <Route path="/purchases" element={<MyPurchases />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/user/:username" element={<UserProfile />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
