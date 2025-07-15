import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';

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
    const [showHandleModal, setShowHandleModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [handleLoading, setHandleLoading] = useState(false);
    const navigate = useNavigate();

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
        const report = reports.find(r => r.reviewId === id) || null;
        setSelectedReport(report);
        setShowHandleModal(true);
    };

    const handleModalSubmit = async (status: 'approved' | 'rejected', reason: string) => {
        if (!selectedReport) return;
        setHandleLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (status === 'approved') {
                await axios.put(`/api/report/approve/${selectedReport.reviewId}`, { reason }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`/api/report/reject/${selectedReport.reviewId}`, { reason }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            await fetchReports();
            setShowHandleModal(false);
            setSelectedReport(null);
        } catch {
            setError('Failed to handle report.');
        } finally {
            setHandleLoading(false);
        }
    };

    const HandleReportModal: React.FC<HandleReportModalProps> = ({ isOpen, onClose, onSubmit, report }) => {
        const [status, setStatus] = useState<'approved' | 'rejected'>('approved');
        const [reason, setReason] = useState('');
        const [error, setError] = useState('');

        useEffect(() => {
            setReason('');
            setStatus('approved');
            setError('');
        }, [isOpen]);

        if (!report) return null;

        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Handle Report">
                <div>
                    <div className="mb-2">
                        <label className="font-semibold">Report Content:</label>
                        <div className="bg-gray-100 p-2 rounded text-sm">{report.content}</div>
                    </div>
                    <div className="mb-2">
                        <label className="font-semibold">Action:</label>
                        <select className="w-full border rounded p-2" value={status} onChange={e => setStatus(e.target.value as any)}>
                            <option value="approved">Approve (Artwork violates policy)</option>
                            <option value="rejected">Reject (No violation)</option>
                        </select>
                    </div>
                    {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                    <div className="flex gap-2 mt-2">
                        <button type="button" className="flex-1 py-2 rounded bg-gray-200" onClick={onClose}>Cancel</button>
                        <button type="button" className="flex-1 py-2 rounded bg-blue-500 text-white" onClick={() => {
                            if (!reason.trim()) { setReason("message will be solve in be"); return; }
                            onSubmit(status, reason);
                        }}>Submit</button>
                    </div>
                </div>
            </Modal>
        );
    };

    const handleProductClick = (productId: number) => {
        navigate(`/art/${productId}`);
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
                                    {r.productImage ? (
                                        <img
                                            src={`/api/product/image/${r.productImage}`}
                                            alt={r.product?.title || 'Product image'}
                                            className="max-w-[80px] max-h-[80px] object-contain rounded-lg shadow-md transition-opacity duration-300 hover:opacity-80 mb-2 mx-auto"
                                            style={{ aspectRatio: '1 / 1' }}
                                            onClick={() => handleProductClick(r.productId)}
                                            onError={e => {
                                                (e.currentTarget as HTMLImageElement).src = '/resource/img/placeholder-image.png';
                                            }}
                                        />
                                    ) : (
                                        <div className="max-w-[80px] max-h-[80px] bg-gray-200 flex items-center justify-center rounded-lg shadow-md mb-2 mx-auto" style={{ aspectRatio: '1 / 1' }}>
                                            <span className="text-gray-400">No image</span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-2 border">{r.user?.name || r.userId}</td>
                                <td className="p-2 border">{r.content}</td>
                                <td className="p-2 border text-center">
                                    {r.isApproved ? <span className="text-green-600 font-semibold">Approved</span> : <span className="text-yellow-600">Pending</span>}
                                </td>
                                <td className="p-2 border text-center">
                                    {!r.isApproved ?
                                        <button
                                            className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                                            onClick={() => handleApprove(r.reviewId)}
                                            disabled={actionLoading === r.reviewId}
                                        >
                                            {actionLoading === r.reviewId ? 'Approving...' : 'Approve'}
                                        </button>
                                        : <span className="text-yellow-600">Approved</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <HandleReportModal
                isOpen={showHandleModal}
                onClose={() => { setShowHandleModal(false); setSelectedReport(null); }}
                onSubmit={handleModalSubmit}
                report={selectedReport}
            />
        </div>
    );
};

export default AdminReportList;
