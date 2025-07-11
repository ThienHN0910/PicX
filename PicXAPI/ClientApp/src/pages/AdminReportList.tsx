import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Report {
  reviewId: number;
  productId: number;
  userId: number;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  product?: { title: string };
  user?: { name: string };
  productImage?: string; // Add image field
}

const AdminReportList: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('/api/report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data);
    } catch (err) {
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`/api/report/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchReports();
    } catch {
      setError('Failed to approve report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`/api/report/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchReports();
    } catch {
      setError('Failed to delete report');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Report Management</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Content</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.reviewId} className="border-b">
                <td className="p-2 border text-center">{r.reviewId}</td>
                <td className="p-2 border">
                  <a href={`/art/${r.productId}`} target="_blank" rel="noopener noreferrer">
                    {r.productImage ? (
                      <img
                        src={`/api/product/image/${r.productImage}`}
                        alt={r.product?.title || 'Product image'}
                        className="max-w-[80px] max-h-[80px] object-contain rounded-lg shadow-md transition-opacity duration-300 hover:opacity-80 mb-2 mx-auto"
                        style={{ aspectRatio: '1 / 1' }}
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = '/resource/img/placeholder-image.png';
                        }}
                      />
                    ) : (
                      <div className="max-w-[80px] max-h-[80px] bg-gray-200 flex items-center justify-center rounded-lg shadow-md mb-2 mx-auto" style={{ aspectRatio: '1 / 1' }}>
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </a>
                </td>
                <td className="p-2 border">{r.user?.name || r.userId}</td>
                <td className="p-2 border">{r.content}</td>
                <td className="p-2 border text-center">
                  {r.isApproved ? <span className="text-green-600 font-semibold">Approved</span> : <span className="text-yellow-600">Pending</span>}
                </td>
                <td className="p-2 border text-center">
                  {!r.isApproved && (
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                      onClick={() => handleApprove(r.reviewId)}
                      disabled={actionLoading === r.reviewId}
                    >
                      {actionLoading === r.reviewId ? 'Approving...' : 'Approve'}
                    </button>
                  )}
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(r.reviewId)}
                    disabled={actionLoading === r.reviewId}
                  >
                    {actionLoading === r.reviewId ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReportList;
