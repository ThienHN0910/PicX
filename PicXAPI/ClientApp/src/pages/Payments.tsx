import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, Wallet } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
            await axios.post(`${API_BASE_URL}/api/orders/${orderId}/pay-wallet`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const productIds = selectedItems.map(item => item.product.product_id);
            console.log("selectedItems:", selectedItems);
            console.log("productIds:", selectedItems.map(item => item.product?.product_id));
            await axios.post(`${API_BASE_URL}/api/cart/remove-multiple`, productIds , {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert("Payment successful!");
            navigate(`/orders/${orderId}`);
        } catch (err: any) {
            console.error(err.response?.data || err);
            alert("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirm Payment</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-4">
                        {selectedItems.map((item) => (
                            <div key={item.product.product_id} className="flex justify-between">
                                <div>
                                    <p className="text-gray-900">{item.product.title}</p>
                                    <p className="text-sm text-gray-500">by {item.product.artist?.name || "Unknown"}</p>
                                </div>
                                <p className="text-gray-900">{item.product.price.toLocaleString()} VND</p>
                            </div>
                        ))}
                        <div className="border-t pt-4 flex justify-between font-semibold text-gray-900">
                            <p>Total</p>
                            <p>{totalAmount.toLocaleString()} VND</p>
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
                            <p className="text-sm font-medium">Internal Wallet</p>
                        </button>
                        <button
                            type="button"
                            className={`flex-1 p-4 border rounded-lg text-center ${paymentMethod === 'credit-card' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                                }`}
                            onClick={() => setPaymentMethod('credit-card')}
                        >
                            <CreditCard className="h-6 w-6 mx-auto mb-1 text-indigo-600" />
                            <p className="text-sm font-medium">Credit Card</p>
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
                        {loading ? "Processing..." : `Pay ${totalAmount.toLocaleString()} VND`}
                    </Button>

                    <div className="mt-4 space-y-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <p>Safe payment via internal wallet</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <p>You can review your order after payment</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
