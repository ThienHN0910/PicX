import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Artist {
    artistId: number;
    name: string;
}

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

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [selectedArtist, setSelectedArtist] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/orders/admin/artists').then(res => {
            setArtists(res.data);
        });
        fetchOrders("all");
    }, []);

    const fetchOrders = async (artistId: string | number) => {
        let res;
        if (artistId === "all") {
            res = await axios.get('/api/orders/admin');
        } else {
            res = await axios.get(`/api/orders/admin/by-artist/${artistId}`);
        }
        setOrders(res.data.orders || []);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const artistId = e.target.value;
        setSelectedArtist(artistId);
        fetchOrders(artistId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Order Management 
                    </h1>
                    <p className="text-slate-600 text-lg">Track and manage all system orders</p>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <label htmlFor="artistSelect" className="text-slate-800 font-semibold text-lg">
                                Filter by Artist
                            </label>
                        </div>
                        <select
                            id="artistSelect"
                            value={selectedArtist}
                            onChange={handleSelectChange}
                            className="flex-1 max-w-md px-6 py-3 border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-700 font-medium"
                        >
                            <option value="all">🎨 All</option>
                            {artists.map((a) => (
                                <option key={a.artistId} value={a.artistId}>
                                    👤 {a.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Orders Grid */}
                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto border border-slate-200">
                            <div className="text-6xl mb-6">📋</div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-2">No orders</h3>
                            <p className="text-slate-500">There are no orders in the system yet.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {orders.map((order) => (
                            <div
                                key={order.orderId}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200 hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
                                onClick={() => navigate(`/admin/order/${order.orderId}`)}
                            >
                                <div className="p-8">
                                    {/* Order Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                                                #{order.orderId}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">Order #{order.orderId}</h3>
                                            </div>
                                        </div>
                                        <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                                            📦
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-600 text-lg">💰</span>
                                                <span className="font-semibold text-slate-700">Total Amount</span>
                                            </div>
                                            <span className="text-xl font-bold text-green-600">${order.totalAmount}</span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600 text-lg">📅</span>
                                                <span className="font-semibold text-slate-700">Order Date</span>
                                            </div>
                                            <span className="text-sm font-medium text-slate-600">
                                                {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                            <div className="flex items-center gap-2">
                                                <span className="text-purple-600 text-lg">📦</span>
                                                <span className="font-semibold text-slate-700">Items</span>
                                            </div>
                                            <span className="text-lg font-bold text-purple-600">{order.items.length}</span>
                                        </div>
                                    </div>

                                    {/* Action Indicator */}
                                    <div className="mt-6 text-center">
                                        <div className="inline-flex items-center gap-2 text-slate-500 group-hover:text-blue-600 transition-colors duration-200">
                                            <span className="text-sm font-medium">View Order Detail</span>
                                            <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}