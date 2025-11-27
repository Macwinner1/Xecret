import { Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/authSlice';
import HomePage from './pages/HomePage';
import CreatorDashboard from './pages/CreatorDashboard';
import ContentViewer from './pages/ContentViewer';
import Login from './pages/Login';
import MyPurchases from './pages/MyPurchases';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation bar */}
      {isAuthenticated && (
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <a href="/" className="text-xl font-bold">
                Anonymous Platform
              </a>
              <a href="/dashboard" className="text-gray-300 hover:text-white">
                Dashboard
              </a>
              <a href="/purchases" className="text-gray-300 hover:text-white">
                My Purchases
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">@{user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<CreatorDashboard />} />
        <Route path="/content/:contentId" element={<ContentViewer />} />
        <Route path="/purchases" element={<MyPurchases />} />
      </Routes>
    </div>
  );
}

export default App;
