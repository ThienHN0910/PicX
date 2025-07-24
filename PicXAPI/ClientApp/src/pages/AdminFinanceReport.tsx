import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

/* ---------- Types ---------- */
interface StatsEntry {
    month: string;
    income: number;
    orderCount: number;
}

interface Order {
    id: number;
    customer: string;
    total: number;
    date: string;
    status: string;
    itemCount: number;
    products: Array<{
        title: string;
        artist: string;
        price: number;
    }>;
}

interface AdminSummary {
    totalUsers: number;
    totalArtists: number;
    totalBuyers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: number;
    recentRevenue: number;
    topProducts: Array<{
        productId: number;
        title: string;
        artist: string;
        totalSold: number;
        totalRevenue: number;
    }>;
}

interface ArtistPerformance {
    artistId: number;
    artistName: string;
    totalSales: number;
    totalOrders: number;
    productCount: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: { payload: { income: number; orderCount: number } }[];
    label?: string;
}

/* ---------- Constants ---------- */
const currencyFormat = (value: number): string =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatMonth = (monthString: string): string => {
    if (monthString === 'Unknown' || monthString === '-') return 'Unknown';
    const [year, month] = monthString.split("-");
    if (!year || !month) return monthString;
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

const formatDate = (dateString: string): string => {
    if (!dateString || dateString === '-') return 'Unknown';
    const [year, month, day] = dateString.split('-');
    if (!day || !month || !year) return dateString;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};

/* ---------- Main Component ---------- */
const AdminFinanceReport: React.FC = () => {
    const [data, setData] = useState<StatsEntry[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [artistPerformance, setArtistPerformance] = useState<ArtistPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [artistLoading, setArtistLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get token from localStorage
    const token = localStorage.getItem('authToken') ?? '';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/finance/admin-statistics', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch statistics');
                }

                const result = await response.json();
                setData(result || []);
            } catch (err) {
                setError('Failed to load statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchOrders = async () => {
            try {
                setOrdersLoading(true);

                const response = await fetch('/api/finance/all-orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const result = await response.json();
                setOrders(result || []);
            } catch (err) {
                console.error(err);
            } finally {
                setOrdersLoading(false);
            }
        };

        const fetchSummary = async () => {
            try {
                setSummaryLoading(true);

                const response = await fetch('/api/finance/admin-summary', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch summary');
                }

                const result = await response.json();
                setSummary(result);
            } catch (err) {
                console.error(err);
            } finally {
                setSummaryLoading(false);
            }
        };

        const fetchArtistPerformance = async () => {
            try {
                setArtistLoading(true);

                const response = await fetch('/api/finance/artist-performance', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch artist performance');
                }

                const result = await response.json();
                setArtistPerformance(result || []);
            } catch (err) {
                console.error(err);
            } finally {
                setArtistLoading(false);
            }
        };

        fetchStats();
        fetchOrders();
        fetchSummary();
        fetchArtistPerformance();
    }, [token]);

    if (loading && summaryLoading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[rgb(66,230,149)] to-[rgb(59,178,184)] mb-3">
                        Admin Financial Dashboard
                    </h1>
                    <p className="text-xl text-gray-700 font-light tracking-wide">Comprehensive analysis of your business performance</p>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <StatsCard
                            title="Total Revenue"
                            value={summary.totalRevenue}
                            color="from-[rgb(100,240,180)] to-[rgb(100,200,210)]"
                            delay="0ms"
                        />
                        <StatsCard
                            title="Total Orders"
                            value={summary.totalOrders}
                            color="from-[rgb(100,240,180)] to-[rgb(100,200,210)]"
                            isCurrency={false}
                            delay="100ms"
                        />
                        <StatsCard
                            title="Total Users"
                            value={summary.totalUsers}
                            color="from-[rgb(100,240,180)] to-[rgb(100,200,210)]"
                            isCurrency={false}
                            delay="200ms"
                        />
                        <StatsCard
                            title="Total Products"
                            value={summary.totalProducts}
                            color="from-[rgb(100,240,180)] to-[rgb(100,200,210)]"
                            isCurrency={false}
                            delay="300ms"
                        />
                    </div>
                )}

                {/* Recent Performance */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6">
                                Recent Activity <span className="text-sm font-normal ml-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">(30 days)</span>
                            </h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="text-gray-700 font-medium">Recent Orders</span>
                                    <span className="text-3xl font-bold text-teal-600">{summary.recentOrders}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="text-gray-700 font-medium">Recent Revenue</span>
                                    <span className="text-3xl font-bold text-green-600">{currencyFormat(summary.recentRevenue)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6">
                                User Breakdown
                            </h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="text-gray-700 font-medium">Artists</span>
                                    <span className="text-3xl font-bold text-teal-600">{summary.totalArtists}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="text-gray-700 font-medium">Buyers</span>
                                    <span className="text-3xl font-bold text-green-600">{summary.totalBuyers}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                    <BarChartSection data={data} />
                    <TopProductsSection products={summary?.topProducts || []} />
                </div>

                {/* Artist Performance */}
                <ArtistPerformanceSection artists={artistPerformance} loading={artistLoading} />

                {/* Orders List */}
                <OrderListSection orders={orders.slice(0, 10)} loading={ordersLoading} />
            </div>
        </div>
    );
};

/* ---------- Components ---------- */

const LoadingState: React.FC = () => (
    <div className="min-h-screen bg-white rounded-2xl flex items-center justify-center font-sans"><div className="text-center">
        <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-[rgb(66,230,149)] border-t-[rgb(59,178,184)] rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[rgb(59,178,184)] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Financial Data</h2>
        <p className="text-gray-600">Please wait while we fetch your reports...</p>
        <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-[rgb(66,230,149)] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[rgb(59,178,184)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-[rgb(66,230,149)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
    </div>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-red-600 mb-4">{message}</p>
            <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-[rgb(66,230,149)] to-[rgb(59,178,184)] text-white px-6 py-2 rounded-xl hover:from-[rgb(56,200,129)] hover:to-[rgb(49,158,164)] transition-all duration-300 font-semibold shadow-lg"
            >
                Try Again
            </button>
        </div>
    </div>
);

const StatsCard: React.FC<{
    title: string;
    value: number | string;
    color: string;
    isCurrency?: boolean;
    delay?: string;
}> = ({ title, value, color, isCurrency = true, delay = "0ms" }) => (
    <div
        className={`relative overflow-hidden bg-gradient-to-br ${color} rounded-2xl p-8 text-gray-800 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slide-up`}
        style={{ animationDelay: delay }}
    >
        <div className="relative z-10">
            <div className="mb-2 text-sm font-medium opacity-90">{title}</div>
            <div className="text-3xl font-bold">
                {typeof value === 'number' && isCurrency ? currencyFormat(value) : value}
            </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-12 translate-x-12 transition-transform duration-300 hover:scale-110" />
    </div>
);

const BarChartSection: React.FC<{ data: StatsEntry[] }> = ({ data }) => (
    <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in-up">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Monthly Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} barCategoryGap="5%" barGap={2}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatMonth}
                />
                <YAxis
                    tickFormatter={currencyFormat}
                    tick={{ fontSize: 12 }}
                    domain={[0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" radius={[4, 4, 0, 0]} fill="url(#themeGradient)" />
                <defs>
                    <linearGradient id="themeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(66,230,149)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="rgb(59,178,184)" stopOpacity={0.9} />
                    </linearGradient>
                </defs>
            </BarChart>
        </ResponsiveContainer>
    </div>
);

const TopProductsSection: React.FC<{ products: AdminSummary['topProducts'] }> = ({ products }) => (
    <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in-up">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Products</h3>
        <div className="space-y-3">
            {products.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No products data available</p>
            ) : (
                products.slice(0, 4).map((product) => (
                    <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{product.title}</h4>
                            <p className="text-sm text-gray-600">by {product.artist}</p>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-green-600">{currencyFormat(product.totalRevenue)}</div>
                            <div className="text-sm text-gray-500">{product.totalSold} sold</div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

const ArtistPerformanceSection: React.FC<{ artists: ArtistPerformance[]; loading: boolean }> = ({ artists, loading }) => (
    <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 animate-fade-in-up">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Artists Performance</h3>
        {loading ? (
            <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-[rgb(66,230,149)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500">Loading artist performance...</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Artist</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Sales</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Orders</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Products</th>
                        </tr>
                    </thead>
                    <tbody>
                        {artists.map((artist, index) => (
                            <tr key={artist.artistId} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="w-8 h-8 bg-gradient-to-br from-[rgb(66,230,149)] to-[rgb(59,178,184)] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-gray-800">{artist.artistName}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-center font-semibold text-green-600">
                                    {currencyFormat(artist.totalSales)}
                                </td>
                                <td className="py-3 px-4 text-center text-gray-700">{artist.totalOrders}</td>
                                <td className="py-3 px-4 text-center text-gray-700">{artist.productCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload?.length) {
        const { income, orderCount } = payload[0].payload;
        return (
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm">
                <div className="font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100">
                    {formatMonth(label || '')}
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="text-green-600 font-semibold">{currencyFormat(income)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Orders:</span>
                        <span className="text-gray-700 font-semibold">{orderCount}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const OrderListSection: React.FC<{ orders: Order[]; loading: boolean }> = ({ orders, loading }) => (
    <div className="animate-fade-in-up">
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Recent Orders</h3>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-[rgb(66,230,149)] rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500">{loading ? 'Loading...' : `${orders.length} orders`}</span>
                </div>
                <Link
                    to="/admin/orders"
                    className="bg-gradient-to-r from-[rgb(66,230,149)] to-[rgb(59,178,184)] text-white px-6 py-2 rounded-xl hover:from-[rgb(56,200,129)] hover:to-[rgb(49,158,164)] font-semibold transition-all duration-300 shadow-lg"
                >
                    View Order List
                </Link>
            </div>
        </div>

        {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center">
                    <div className="w-6 h-6 border-2 border-[rgb(66,230,149)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading orders...</p>
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                    <div className="text-center">Order ID</div>
                    <div className="text-center">Date</div>
                    <div className="text-center">Customer</div>
                    <div className="text-center">Items</div>
                    <div className="text-center">Total</div>
                </div>
                <div className="divide-y divide-gray-100">
                    {orders.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>No orders found</p>
                        </div>
                    ) : (
                        orders.map((order, index) => (
                            <div
                                key={order.id}
                                className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-150 animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="text-center font-medium text-teal-600">#{order.id}</div>
                                <div className="text-center text-gray-500">{formatDate(order.date)}</div>
                                <div className="text-center text-gray-800 font-medium">{order.customer}</div>
                                <div className="text-center text-gray-600">{order.itemCount} items</div>
                                <div className="text-center text-green-600 font-bold">{currencyFormat(order.total)}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
    </div>
);

export default AdminFinanceReport;