import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { contentAPI, paymentAPI } from '../api/client';

function CreatorDashboard() {
  const [uploadType, setUploadType] = useState('photo');
  const [accessType, setAccessType] = useState('free');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [myContent, setMyContent] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadMyContent();
    loadEarnings();
  }, [isAuthenticated]);

  const loadMyContent = async () => {
    try {
      const username = localStorage.getItem('username');
      const response = await contentAPI.getByCreator(username);
      setMyContent(response.data.contents);
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };

  const loadEarnings = async () => {
    try {
      const response = await paymentAPI.getEarnings();
      setEarnings(response.data);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (accessType === 'ppv' && (!price || parseFloat(price) <= 0)) {
      setError('Please set a valid price for pay-per-view content');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('content_type', uploadType);
      formData.append('access_type', accessType);
      formData.append('price', accessType === 'ppv' ? price : '0');

      await contentAPI.upload(formData);
      
      setSuccess('Content uploaded successfully!');
      setFile(null);
      setPrice('');
      e.target.reset();
      
      // Reload content
      loadMyContent();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (contentId, paidViewerCount) => {
    if (paidViewerCount > 0) {
      alert(`Cannot delete - ${paidViewerCount} viewers have purchased this content`);
      return;
    }

    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await contentAPI.delete(contentId);
      setSuccess('Content deleted successfully');
      loadMyContent();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const totalViews = myContent.reduce((sum, c) => sum + c.view_count, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <Link to="/" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold">
              {earnings ? earnings.total_earnings.toFixed(2) : '0.00'} SUI
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 mb-2">Total Views</h3>
            <p className="text-3xl font-bold">{totalViews}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 mb-2">Content Pieces</h3>
            <p className="text-3xl font-bold">{myContent.length}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Upload Content</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div className="mb-4">
              <label className="block mb-2">Content Type</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                disabled={uploading}
              >
                <option value="photo">Photo</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Access Type</label>
              <select
                value={accessType}
                onChange={(e) => setAccessType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                disabled={uploading}
              >
                <option value="free">Free</option>
                <option value="ppv">Pay-Per-View</option>
              </select>
            </div>

            {accessType === 'ppv' && (
              <div className="mb-4">
                <label className="block mb-2">Price (SUI)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                  disabled={uploading}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block mb-2">Upload File</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                disabled={uploading}
              />
              {file && (
                <p className="text-sm text-gray-400 mt-2">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Content'}
            </button>
          </form>

          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ Once viewers purchase your content, you cannot delete it. 
              They have permanent access rights.
            </p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">My Content</h2>
          {myContent.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {myContent.map((content) => (
                <div
                  key={content.content_id}
                  className="bg-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="aspect-square flex items-center justify-center text-4xl">
                    {content.content_type === 'photo' ? '📷' : '🎥'}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                        {content.access_type === 'free' ? 'FREE' : `${content.price} SUI`}
                      </span>
                      {content.deletion_locked && (
                        <span className="text-xs bg-red-600 px-2 py-1 rounded" title="Cannot delete - has paid viewers">
                          🔒
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {content.view_count} views • {content.paid_viewer_count} purchases
                    </p>
                    <div className="flex gap-2">
                      <Link
                        to={`/content/${content.content_id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs text-center"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(content.content_id, content.paid_viewer_count)}
                        className="flex-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs disabled:opacity-50"
                        disabled={content.deletion_locked}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No content yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreatorDashboard;
