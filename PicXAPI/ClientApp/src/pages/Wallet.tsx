import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'react-toastify';

const Wallet = () => {
    const [balance, setBalance] = useState<number>(0);
    const [amount, setAmount] = useState<number>(0);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('authToken');

    const fetchWallet = async () => {
        try {
            const res = await axios.get('/api/wallet/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setBalance(res.data.balance);
        } catch (err) {
            toast.error('Không thể tải thông tin ví.');
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get('/api/withdraw-request/my-requests', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setRequests(res.data);
        } catch (err) {
            toast.error('Không thể tải yêu cầu rút tiền.');
        }
    };

    const handleWithdraw = async () => {
        if (amount <= 0) return toast.warning('Vui lòng nhập số tiền hợp lệ.');
        setLoading(true);
        try {
            await axios.post('/api/withdraw-request', { amount }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            toast.success('Yêu cầu rút tiền đã được gửi.');
            setAmount(0);
            await fetchWallet();
            await fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gửi yêu cầu thất bại.');
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
            <h1 className="text-2xl font-bold mb-4">Ví của bạn</h1>
            <p className="text-lg mb-4">Số dư hiện tại: <span className="font-semibold text-green-600">${balance.toFixed(2)}</span></p>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-2">Yêu cầu rút tiền</h2>
                <div className="flex space-x-4">
                    <Input
                        type="number"
                        placeholder="Nhập số tiền muốn rút"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                    />
                    <Button onClick={handleWithdraw} disabled={loading}>
                        {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </Button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Lịch sử yêu cầu rút tiền</h2>
                {requests.length === 0 ? (
                    <p className="text-gray-500">Chưa có yêu cầu nào.</p>
                ) : (
                    <ul className="space-y-3">
                        {requests.map((req) => (
                            <li key={req.requestId} className="border p-3 rounded-lg">
                                <div className="flex justify-between">
                                    <span>Số tiền: ${req.amountRequested}</span>
                                    <span className="capitalize">{req.status}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Gửi lúc: {new Date(req.requestedAt).toLocaleString()}
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
