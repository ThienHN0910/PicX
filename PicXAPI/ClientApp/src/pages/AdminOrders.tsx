/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store'; // Nhập useStore
import { getAuthHeader } from '../lib/store'; // Nhập getAuthHeader
import { Package, Search } from 'lucide-react';
import { formatDate, sortOrders } from '../lib/utils'
import { Order, Artist } from '../lib/types'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [selectedArtist, setSelectedArtist] = useState("all");
    const navigate = useNavigate();
    const { user, fetchAndSetUser } = useStore(); 
    const [sortConfig, setSortConfig] = useState<{
        key: 'totalAmount' | 'orderDate' | null;
        direction: 'asc' | 'desc';
    }>({ key: null, direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/orders/admin/artists`, {
                    headers: getAuthHeader(), 
                });
                setArtists(response.data);
            } catch (err) {
                console.error('Error fetching artists:', err);
                alert('Cannot load artists. Please try again.');
                if (err.response?.status === 401) {
                    navigate('/login'); 
                }
            }
        };

        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/orders/admin`, {
                    headers: getAuthHeader(), 
                });
                setOrders(response.data.orders || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
                alert('Cannot load orders. Please try again.');
                if (err.response?.status === 401) {
                    navigate('/login'); 
                }
            }
        };

        fetchArtists();
        fetchOrders();
    }, [navigate]);

    const fetchOrdersByArtist = async (artistId: string | number) => {
        try {
            let response;
            if (artistId === "all") {
                response = await axios.get(`${API_BASE_URL}/api/orders/admin`, {
                    headers: getAuthHeader(),
                });
            } else {
                response = await axios.get(`${API_BASE_URL}/api/orders/admin/by-artist/${artistId}`, {
                    headers: getAuthHeader(), 
                });
            }
            setOrders(response.data.orders || []);
        } catch (err) {
            console.error('Error fetching orders by artist:', err);
            alert('Cannot load orders. Please try again.');
            if (err.response?.status === 401) {
                navigate('/login'); 
            }
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const artistId = e.target.value;
        setSelectedArtist(artistId);
        fetchOrdersByArtist(artistId);
    };

    const handleSort = (key: 'totalAmount' | 'orderDate') => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const filteredOrders = orders.filter((order) =>
        order.orderId.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        formatDate(order.orderDate).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedOrders = sortOrders(filteredOrders, sortConfig.key, sortConfig.direction);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main content */}
            <div>
                {/* Top bar */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Package />
                        <h1 className="text-2xl font-bold text-gray-900">Order List</h1>
                    </div>
                    <div className="flex items-center justify-between gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>{filteredOrders.length} orders</span>
                        </div>
                        <div className="relative w-64">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by ID, Buyer or Date"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Content area */}
                <div className="pt-8">
                    <div className="bg-white rounded-lg border border-gray-200">
                        {/* Table header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <select
                                            value={selectedArtist}
                                            onChange={handleSelectChange}
                                            className="appearance-none bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xl"
                                        >
                                            <option value="all">All Artists</option>
                                            {artists.map((a) => (
                                                <option key={a.artistId} value={a.artistId}>
                                                    {a.name}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="absolute right-2 top-2.5 text-blue-500 drop-shadow-lg animate-bounce hover:animate-pulse transition-all duration-300 pointer-events-none">🎨</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table content */}
                        {filteredOrders.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="text-4xl mb-4">📦</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                <p className="text-gray-500">No orders match the current filter criteria.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {/* Column headers */}
                                <div className="grid grid-cols-6 gap-4 px-3 py-3 bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                    <div>Order ID</div>
                                    <div>Items</div>
                                    <div>Buyer</div>
                                    <div
                                        className={`flex items-center cursor-pointer hover:text-gray-700 ${sortConfig.key === 'totalAmount' ? 'text-gray-900' : ''
                                            }`}
                                        onClick={() => handleSort('totalAmount')}
                                    >
                                        Total
                                        <span className="ml-2 text-base">
                                            {sortConfig.key === 'totalAmount' && sortConfig.direction === 'asc' ? '▲' : '▼'}
                                        </span>
                                    </div>
                                    <div
                                        className={`flex items-center cursor-pointer hover:text-gray-700 ${sortConfig.key === 'orderDate' ? 'text-gray-900' : ''
                                            }`}
                                        onClick={() => handleSort('orderDate')}
                                    >
                                        Order Date
                                        <span className="ml-2 text-base">
                                            {sortConfig.key === 'orderDate' && sortConfig.direction === 'asc' ? '▲' : '▼'}
                                        </span>
                                    </div>
                                    <div>Status</div>
                                </div>

                                {/* Table rows */}
                                <div className="divide-y divide-gray-100">
                                    {sortedOrders.map((order) => (
                                        <div
                                            key={order.orderId}
                                            className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/admin/order/${order.orderId}`)}
                                        >
                                            {/* Order ID */}
                                            <div className="flex items-center">
                                                <span className="font-mono text-base font-bold text-blue-500">
                                                    #{order.orderId.toString()}
                                                </span>
                                            </div>

                                            {/* Number of items */}
                                            <div className="flex items-center gap-2 ml-3">
                                                <span className="text-sm font-medium text-gray-900 text-center">
                                                    {order.items.length || '---'}
                                                </span>
                                            </div>

                                            {/*Buyer*/}
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900 text-center">
                                                    {order.buyerName}
                                                </span>
                                            </div>

                                            {/* Total Amount */}
                                            <div className="flex items-center ">
                                                <span className="text-sm text-gray-600 font-bold">
                                                    {order.items.reduce((total, item) => total + item.totalPrice, 0)?.toLocaleString() || '...'} VND
                                                </span>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">📅</span>
                                                <span className="text-sm text-gray-900">
                                                    {formatDate(order.orderDate)}
                                                </span>
                                            </div>

                                            {/* Status */}
                                            <div className="flex items-center">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                                                >
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
}