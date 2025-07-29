import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Wallet = () => {
    const [balance, setBalance] = useState<number>(0);
    const [amount, setAmount] = useState<number>(0);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();

    const fetchWallet = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/wallet/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setBalance(res.data.balance);
        } catch (err) {
            toast.error('Cannot load wallet information.');
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/withdraw-request/my-requests`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setRequests(res.data);
        } catch (err) {
            toast.error('Cannot load withdrawal requests.');
        }
    };

    const handleWithdraw = async () => {
        if (amount <= 0) return toast.warning('Please enter a valid amount.');
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/withdraw-request`, { amount }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            toast.success('Withdrawal request sent successfully.');
            setAmount(0);
            await fetchWallet();
            await fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send withdrawal request.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
        fetchRequests();
    }, []);

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Your Wallet</h1>
                <Button onClick={() => navigate('/deposit')} variant="primary">
                    Deposit to Wallet
                </Button>
            </div>

            <p className="text-lg mb-4">Current Balance: <span className="font-semibold text-green-600">{balance.toLocaleString()} VND</span></p>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-2">Withdrawal Request</h2>
                <div className="flex space-x-4">
                    <Input
                        type="number"
                        placeholder="Enter amount to withdraw"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                    />
                    <Button onClick={handleWithdraw} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Request'}
                    </Button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Withdrawal Request History</h2>
                {requests.length === 0 ? (
                    <p className="text-gray-500">No requests yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {requests.map((req) => (
                            <li key={req.requestId} className="border p-3 rounded-lg">
                                <div className="flex justify-between">
                                    <span>Amount: {req.amountRequested.toLocaleString()} VND</span>
                                    <span className="capitalize">{req.status}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Sent at: {new Date(req.requestedAt).toLocaleString()}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Wallet;
