import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, Wallet } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';

const Payments = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'credit-card'>('wallet');
    const [loading, setLoading] = useState(false);
    const selectedItems = useStore(state => state.selectedItems);
    const token = localStorage.getItem('authToken');

    const totalAmount = selectedItems.reduce(
        (sum, item) => sum + item.product.price,
        0
    );

    const handleConfirmPayment = async () => {
        console.log(orderId)
        if (!orderId) return;
        try {
            setLoading(true);
            await axios.post(`/api/orders/${orderId}/pay-wallet`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            await axios.post('/api/cart/remove-multiple', selectedItems, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert("Thanh toán thành công!");
            navigate(`/orders/${orderId}`);
        } catch (err: any) {
            console.error(err.response?.data || err);
            alert("Thanh toán thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Xác nhận thanh toán</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
                    <div className="space-y-4">
                        {selectedItems.map((item) => (
                            <div key={item.product.product_id} className="flex justify-between">
                                <div>
                                    <p className="text-gray-900">{item.product.title}</p>
                                    <p className="text-sm text-gray-500">by {item.product.artist?.name || "Unknown"}</p>
                                </div>
                                <p className="text-gray-900">${item.product.price.toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="border-t pt-4 flex justify-between font-semibold text-gray-900">
                            <p>Tổng cộng</p>
                            <p>${totalAmount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-6">
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            className={`flex-1 p-4 border rounded-lg text-center ${paymentMethod === 'wallet' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                                }`}
                            onClick={() => setPaymentMethod('wallet')}
                        >
                            <Wallet className="h-6 w-6 mx-auto mb-1 text-indigo-600" />
                            <p className="text-sm font-medium">Ví nội bộ</p>
                        </button>
                        <button
                            type="button"
                            className={`flex-1 p-4 border rounded-lg text-center ${paymentMethod === 'credit-card' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                                }`}
                            onClick={() => setPaymentMethod('credit-card')}
                        >
                            <CreditCard className="h-6 w-6 mx-auto mb-1 text-indigo-600" />
                            <p className="text-sm font-medium">Thẻ tín dụng</p>
                        </button>
                    </div>

                    {/* Card Form (optional) */}
                    {paymentMethod === 'credit-card' && (
                        <div className="space-y-4">
                            <Input placeholder="Card Number" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="MM/YY" />
                                <Input placeholder="CVV" />
                            </div>
                            <Input placeholder="Cardholder Name" />
                        </div>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleConfirmPayment}
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : `Thanh toán $${totalAmount.toFixed(2)}`}
                    </Button>

                    <div className="mt-4 space-y-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <p>Thanh toán an toàn qua ví nội bộ</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <p>Bạn có thể xem lại đơn hàng sau khi thanh toán</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
