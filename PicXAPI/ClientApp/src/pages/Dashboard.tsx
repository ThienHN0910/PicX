import React from 'react';
import { useStore } from '../lib/store';
import { BarChart3, Package, ShoppingCart, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const DashboardCard = ({ title, value, icon: Icon, className = '' }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <h3 className="text-2xl font-semibold mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-full ${className}`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useStore();

    const stats = [
        {
            title: 'Total Sales',
            value: '$12,426',
            icon: BarChart3,
            className: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Active Products',
            value: '15',
            icon: Package,
            className: 'bg-green-100 text-green-600',
        },
        {
            title: 'Pending Orders',
            value: '4',
            icon: ShoppingCart,
            className: 'bg-yellow-100 text-yellow-600',
        },
        {
            title: 'Total Customers',
            value: '128',
            icon: Users,
            className: 'bg-purple-100 text-purple-600',
        },
    ];

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/orders', {
                    withCredentials: true
                });
                // Giả sử response trả về { orders: [...] }
                const sorted = response.data.orders
                    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                    .slice(0, 5);
                setOrders(sorted);
            } catch (err) {
                console.error("Failed to fetch recent orders", err);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Complete':
                return 'text-green-600';
            case 'Pending':
                return 'text-yellow-500';
            default:
                return 'text-red-500';
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name || 'Artist'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <DashboardCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                        <Link to="/orders" className="text-sm text-indigo-600 hover:underline">
                            View Order History
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <p className="text-gray-500">No recent orders to display</p>
                    ) : (
                        <ul className="space-y-3">
                            {orders.map(order => (
                                <li key={order.orderId} className="bg-gray-50 rounded-md px-4 py-2 hover:bg-gray-100">
                                    <Link to={`/orders/${order.orderId}`} className="block">
                                        <div>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <p>
                                                    OrderId: #{order.orderId} — {new Date(order.orderDate).toLocaleDateString()}
                                                </p>
                                                <p className={`font-medium text-sm ${getStatusColor("Complete")}`}>
                                                    Complete
                                                </p>
                                            </div>

                                            <p className="text-sm font-semibold text-gray-700 mt-1">
                                                ${order.totalAmount.toLocaleString()}
                                            </p>
                                        </div>

                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Products</h2>
                    <div className="space-y-4">
                        {/* Placeholder for popular products */}
                        <p className="text-gray-500">No popular products to display</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;