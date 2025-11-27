import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { paymentAPI } from '../api/client';

function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPurchases();
  }, [isAuthenticated]);

  const loadPurchases = async () => {
    try {
      const response = await paymentAPI.getPurchases();
      setPurchases(response.data.purchases);
    } catch (error) {
      console.error('Failed to load purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Purchases</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : purchases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {purchases.map((purchase) => (
              <div
                key={purchase.purchase_id}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                <div className="aspect-square flex items-center justify-center text-6xl bg-gray-700">
                  {purchase.content.content_type === 'photo' ? '📷' : '🎥'}
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-400 mb-2">
                    by @{purchase.content.creator_username}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-400">
                      Paid: {purchase.amount} SUI
                    </span>
                    <span className="text-xs text-green-400">
                      Permanent Access
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Purchased: {new Date(purchase.purchased_at).toLocaleDateString()}
                  </p>
                  <Link
                    to={`/content/${purchase.content_id}`}
                    className="block w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-center"
                  >
                    View Content
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400 mb-4">You haven't purchased any content yet</p>
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

export default MyPurchases;
