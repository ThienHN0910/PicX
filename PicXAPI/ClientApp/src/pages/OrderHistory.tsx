import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useStore } from '../lib/store';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDate } from '../lib/utils'
import { useNavigate } from 'react-router-dom';
import { Order} from '../lib/types'

const OrderHistory = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const navigate = useNavigate();

    // Helper to get auth header
    const getAuthHeader = () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('/api/orders', {
                    headers: getAuthHeader()
                });
                // Giả sử response trả về { orders: [...] }
                const sorted = res.data.orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                setOrders(sorted);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main content */}
            <div>
                {/* Top bar */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Package></Package>
                        <h1 className="text-2xl font-bold text-gray-900">Order List</h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>{orders.length} orders</span>
                    </div>
                </div>

                {/* Content area */}
                <div className="pt-8">
                    <div className="bg-white rounded-lg border border-gray-200">
                        {/* Table content */}
                        {orders.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="text-4xl mb-4">📦</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                <p className="text-gray-500">No orders match the current filter criteria.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {/* Column headers */}
                                <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                    <div>Order ID</div>
                                    <div>Items</div>
                                    <div>Total Amount</div>
                                    <div>Date</div>
                                    <div>Status</div>
                                </div>

                                {/* Table rows */}
                                <div className="divide-y divide-gray-100">
                                        {orders.map((order, index) => (
                                        <div
                                            key={order.orderId}
                                            className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/admin/order/${order.orderId}`)}
                                        >
                                            {/* Order ID */}
                                            <div className=" flex items-center">
                                                <span className="font-mono text-base font-bold text-blue-500">
                                                    #{order.orderId.toString()}
                                                </span>
                                            </div>

                                            {/* Number of items*/}
                                            <div className=" flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900 text-center">
                                                    {order.items.length || '---'}
                                                </span>
                                            </div>

                                            {/* Total Amount */}
                                            <div className=" flex items-center">
                                                <span className="text-sm text-gray-600 font-bold">
                                                    {order.items.reduce((total, item) => total + item.totalPrice, 0) || 'Art Project'} $
                                                </span>
                                            </div>

                                            {/* Date */}
                                            <div className=" flex items-center gap-2">
                                                <span className="text-gray-400">📅</span>
                                                <span className="text-sm text-gray-900">
                                                    {formatDate(order.orderDate)}
                                                </span>
                                            </div>

                                            {/* Status */}
                                            <div className=" flex items-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                    bg-green-100 text-green-700`}>
                                                    Complete
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;