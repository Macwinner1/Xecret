import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';
import { authAPI } from '../api/client';

function Login() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleZKLogin = async (provider) => {
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      if (isNewUser) {
        // Register new user
        response = await authAPI.zkLogin(provider, username);
      } else {
        // Login existing user
        response = await authAPI.login(username);
      }

      const { token, user_id, username: userName, wallet_address, account_type } = response.data;

      // Store token
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('username', userName);

      // Update Redux state
      dispatch(setUser({
        user_id,
        username: userName,
        wallet_address,
        account_type,
      }));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      if (err.response?.data?.error?.includes('already taken')) {
        setIsNewUser(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isNewUser ? 'Create Account' : 'Sign In'}
        </h2>
        
        <div className="mb-6">
          <label className="block mb-2 text-sm">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username (3-20 characters)"
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleZKLogin('google')}
            disabled={loading}
            className="w-full bg-white text-gray-900 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Continue with Google'}
          </button>
          <button
            onClick={() => handleZKLogin('facebook')}
            disabled={loading}
            className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Continue with Facebook'}
          </button>
          <button
            onClick={() => handleZKLogin('apple')}
            disabled={loading}
            className="w-full bg-black py-3 rounded-lg hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Continue with Apple'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsNewUser(!isNewUser)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {isNewUser ? 'Already have an account? Sign in' : 'New user? Create account'}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Your identity remains anonymous. We use zero-knowledge proofs to verify 
          authentication without storing personal data.
        </p>
      </div>
    </div>
  );
}

export default Login;
