import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useStore } from '../lib/store';
import React, { useEffect, useState } from 'react';
import axios from 'axios';


const OrderHistory = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('/api/orders', {
                    withCredentials: true
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
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                <p className="mt-2 text-gray-600">View and track your orders</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {orders.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                        <p className="mt-1 text-gray-500">Start shopping to see your orders here</p>
                        <Link
                            to="/"
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Browse Artwork
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {orders.map((order) => (
                            <div key={order.orderId} className="p-6 hover:bg-gray-50">
                                <Link to={`/orders/${order.orderId}`} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600">
                                                Order #{order.orderId}
                                            </p>
                                            <div className="ml-2">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {order.status ?? 'Completed'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex justify-between">
                                            <div className="sm:flex">
                                                <p className="text-sm text-gray-500">
                                                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                                                </p>
                                                <p className="mt-1 sm:mt-0 sm:ml-6 text-sm text-gray-500">
                                                    {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                                                </p>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">
                                                ${order.totalAmount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="ml-4 h-5 w-5 text-gray-400" />
                                </Link>
                            </div>
                        ))}

                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;