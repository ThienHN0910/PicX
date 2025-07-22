import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle } from 'lucide-react';

interface WithdrawalRequest {
    requestId: number;
    userId: number;
    userName: string;
    userRole: string;
    amountRequested: number;
    amountReceived: number;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    bankName: string;
    bankAccountNumber: string;
    momoNumber: string;
}

const AdminWithdrawals = () => {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('authToken');

    const fetchRequests = async () => {
        try {
            const res = await axios.get('/api/admin/withdrawal-requests', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch withdrawal requests:', err);
        }
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        setLoading(true);
        try {
            await axios.post(`/api/admin/withdrawal-requests/${id}/${action}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            await fetchRequests();
        } catch (err) {
            alert('Processing failed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">Pending Withdrawal Requests</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left p-3">User</th>
                            <th className="text-left p-3">Role</th>
                            <th className="text-left p-3">Amount</th>
                            <th className="text-left p-3">Time</th>
                            <th className="text-left p-3">Payment Info</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req.requestId} className="border-b">
                                <td className="p-3">{req.userName}</td>
                                <td className="p-3 capitalize">{req.userRole}</td>
                                <td className="p-3 text-red-600 font-medium">{req.amountRequested.toFixed(0)}VND</td>
                                <td className="p-3 text-sm text-gray-600">{new Date(req.requestedAt).toLocaleString()}</td>
                                <td className="p-3 text-sm text-gray-700">
                                    <div><strong>Bank:</strong> {req.bankName} - {req.bankAccountNumber}</div>
                                    <div><strong>Momo:</strong> {req.momoNumber}</div>
                                </td>
                                <td className="p-3 capitalize">{req.status}</td>
                                <td className="p-3 space-x-2">
                                    <Button
                                        disabled={loading || req.status !== 'pending'}
                                        onClick={() => handleAction(req.requestId, 'approve')}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1 inline" /> Approve
                                    </Button>
                                    <Button
                                        disabled={loading || req.status !== 'pending'}
                                        onClick={() => handleAction(req.requestId, 'reject')}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        <XCircle className="w-4 h-4 mr-1 inline" /> Reject
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                    No pending requests.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminWithdrawals;
