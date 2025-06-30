import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
    productId: number;
    productTitle: string;
    totalPrice: number;
    imageUrl: string;
    artistName: string;
}

interface Order {
    orderId: number;
    totalAmount: number;
    orderDate: string;
    items: OrderItem[];
}

export default function ArtistOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/orders/artist', { withCredentials: true })
            .then(res => {
                setOrders(res.data.orders || []);
            })
            .catch(() => {
                alert("Cannot load Orders.");
            });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6">
                        <span className="text-3xl text-white">🎨</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                        My order
                    </h1>
                    <p className="text-slate-600 text-lg">Track orders from customers who have purchased your work</p>
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl">📊</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Order Overview</h3>
                                <p className="text-slate-600">Current order statistics</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-orange-600">{orders.length}</div>
                            <div className="text-slate-600">Order</div>
                        </div>
                    </div>
                </div>

                {/* Orders Grid */}
                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-lg mx-auto border border-slate-200">
                            <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">🛒</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-4">No orders yet</h3>
                            <p className="text-slate-500 text-lg mb-6">No customers have purchased your product yet.</p>
                            <div className="inline-flex items-center gap-2 text-orange-600 font-medium">
                                <span>💡</span>
                                <span>Keep creating and promoting your work!</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {orders.map(order => (
                            <div
                                key={order.orderId}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200 hover:border-orange-300 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                                onClick={() => navigate(`/artist/order/${order.orderId}`)}
                            >
                                <div className="p-8">
                                    {/* Order Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                                #{order.orderId}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">Order #{order.orderId}</h3>
                                                <p className="text-slate-500 text-sm">Orders from customers</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                                            <div className="flex items-center gap-3">
                                                <div className=" flex items-center justify-center">
                                                    <span>💰</span>
                                                </div>
                                                <span className="font-semibold text-slate-700">Total</span>
                                            </div>
                                            <span className="text-xl font-bold text-emerald-600">${order.totalAmount}</span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center">
                                                    <span>📅</span>
                                                </div>
                                                <span className="font-semibold text-slate-700">Order Date</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-slate-700">
                                                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {new Date(order.orderDate).toLocaleTimeString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center">
                                                    <span>📦</span>
                                                </div>
                                                <span className="font-semibold text-slate-700">Items</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-purple-600">{order.items.length}</span>
                                                <span className="text-sm text-slate-500">item(s)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Indicator */}
                                    <div className="mt-6 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-medium group-hover:shadow-lg transition-all duration-200">
                                            <span>Xem chi tiết</span>
                                            <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom accent line */}
                                <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}