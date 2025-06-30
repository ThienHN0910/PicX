import { useParams } from 'react-router-dom';
import { Package, Truck, CreditCard, Calendar, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrderDetail = () => {
    const { id } = useParams();

    interface OrderItem {
        productId: number;
        productTitle: string;
        totalPrice: number;
        imageUrl: string;
        artistName: string;
    }

    interface Order {
        orderId: string;
        orderDate: string;
        totalAmount: number;
        buyerName: string;
        items: OrderItem[];
    }

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);

        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${id}`, {
                    withCredentials: true
                });
                setOrder(response.data);
            } catch (err) {
                console.error("Failed to fetch order", err);
            }
        };
        fetchOrder();
    }, [id]);

    const [order, setOrder] = useState<Order | null>(null);

<<<<<<< HEAD
=======
    // Helper to get auth header
    const getAuthHeader = () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

>>>>>>> origin/main
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${id}`, {
                    headers: getAuthHeader()
                });
                setOrder(response.data);
            } catch (err) {
                console.error("Failed to fetch order", err);
            }
        };
        fetchOrder();
    }, [id]);

    //Debug
    console.log("productIds:", order?.items.map(item => item.productId));
    //

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'delivered':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!order || !Array.isArray(order.items)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md text-center border border-slate-200">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Package className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Loading order...</h3>
                    <p className="text-slate-500">Please wait a moment</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-6">
                        <Package className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Order Detail
                    </h1>
                    <p className="text-slate-600 text-lg">Order details #{order.orderId}</p>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-slate-200 overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full transform translate-x-16 -translate-y-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-purple-100 rounded-full transform -translate-x-12 translate-y-12"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">#{order.orderId}</span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800">Order #{order.orderId}</h2>
                                    <p className="text-slate-600">Order details</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-lg font-semibold shadow-lg">
                                    <CreditCard className="h-5 w-5" />
                                    Paid
                                </span>
                            </div>
                        </div>

                        {/* Order Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-slate-700">Order Date</span>
                                </div>
                                <p className="text-slate-600 font-medium">
                                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                </p>
                                <p className="text-slate-500 text-sm">
                                    {new Date(order.orderDate).toLocaleTimeString('vi-VN')}
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-slate-700">Pay</span>
                                </div>
                                <p className="text-slate-600 font-medium">Credit card</p>
                                <p className="text-slate-500 text-sm">Confirmed</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-slate-700">Items</span>
                                </div>
                                <p className="text-slate-600 font-medium">{order.items.length} item (s)</p>
                                <p className="text-slate-500 text-sm">Total</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-slate-700">Customer</span>
                                </div>
                                <p className="text-slate-600 font-medium">{order.buyerName}</p>
                                <p className="text-slate-500 text-sm">Buyer</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items Section */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-slate-200">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">Product List</h3>
                            <p className="text-slate-600">Details of works in the order</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {order.items.map((item, index) => (
                            <div key={item.productId} className="group bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-6">
                                    {/* Product Image */}
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productTitle}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => e.currentTarget.src = '/placeholder-image.jpg'}
                                            />
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <div className="mb-3">
                                            <h4 className="text-xl font-bold text-slate-800 mb-1">
                                                🎨 {item.productTitle}
                                            </h4>
                                            <p className="text-slate-600 flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span className="font-medium">Artist:</span>
                                                <span className="text-indigo-600 font-semibold">{item.artistName ?? 'unknow'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
                                            <p className="text-2xl font-bold">${item.totalPrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total Summary */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl shadow-2xl p-8 text-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Total order</h3>
                                <p className="text-green-100">Total amount of products</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold">${order.totalAmount.toFixed(2)}</p>
                            <p className="text-green-100">Paid</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;