import React, { useEffect, useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

/* ---------- Types ---------- */
interface StatsEntry {
    month: string;
    income: number;
    orderCount: number;
}

interface OrderItem {
    id: number;
    customer: string;
    total: number;
    date: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: { payload: { income: number; orderCount: number; net: number } }[];
    label?: string;
}

/* ---------- Constants ---------- */
const COLORS = ['#3b82f6'];

const currencyFormat = (value: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatMonth = (monthString: string): string => {
    if (monthString === '-') return 'Unknown';
    const [year, month] = monthString.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

/* ---------- Main Component ---------- */
const AdminFinanceReport: React.FC = () => {
    const [data, setData] = useState<StatsEntry[]>([]);
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Lấy token từ localStorage
    const token = localStorage.getItem('authToken') ?? '';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);

                // Thay thế bằng API call thực
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

        fetchStats();
        fetchOrders();
    }, [token]);

    const { totalIncome, totalOrders, averageOrders, bestMonth, bestMonthAmount, chartData } = useMemo(() => {
        const totalIncome = data.reduce((sum, e) => sum + e.income, 0);
        const totalOrders = data.reduce((sum, e) => sum + e.orderCount, 0);
        const averageOrders = data.length ? Math.round(totalOrders / data.length) : 0;
        const best = data.reduce(
            (max, e) => (e.income > max.income ? e : max),
            { month: '-', income: 0, orderCount: 0 }
        );
        return {
            totalIncome,
            totalOrders,
            averageOrders,
            bestMonth: best.month,
            bestMonthAmount: best.income,
            chartData: data.map(e => ({ ...e, net: e.income })),
        };
    }, [data]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Admin Financial Overview
                    </h1>
                    <p className="text-gray-600">Comprehensive analysis of your business performance</p>
                </div>

                <SummaryCards
                    totalIncome={totalIncome}
                    totalOrders={totalOrders}
                    bestMonth={bestMonth}
                    bestMonthAmount={bestMonthAmount}
                    averageOrders={averageOrders}
                />

                <BarChartSection data={chartData} />

                <OrderListSection orders={orders} loading={ordersLoading} />
            </div>
        </div>
    );
};

/* ---------- Components ---------- */

const LoadingState: React.FC = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Financial Data</h2>
            <p className="text-gray-500">Please wait while we fetch your reports...</p>
            <div className="mt-4 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
        </div>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-red-600 mb-4">{message}</p>
            <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
                Try Again
            </button>
        </div>
    </div>
);

const SummaryCards: React.FC<{
    totalIncome: number;
    totalOrders: number;
    bestMonth: string;
    bestMonthAmount: number;
    averageOrders: number;
}> = ({ totalIncome, totalOrders, bestMonth, bestMonthAmount, averageOrders }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
            title="Total Income"
            value={totalIncome}
            color="from-blue-500 to-blue-600"
            delay="0ms"
        />
        <StatsCard
            title="Total Orders"
            value={totalOrders}
            color="from-blue-600 to-blue-700"
            isCurrency={false}
            delay="100ms"
        />
        <StatsCard
            title="Best Month"
            value={`${formatMonth(bestMonth)}\n${currencyFormat(bestMonthAmount)}`}
            color="from-amber-500 to-amber-600"
            isCurrency={false}
            delay="200ms"
        />
        <StatsCard
            title="Average Orders"
            value={`${averageOrders} orders`}
            color="from-emerald-500 to-emerald-600"
            isCurrency={false}
            delay="300ms"
        />
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
        className={`relative overflow-hidden bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slide-up`}
        style={{ animationDelay: delay }}
    >
        <div className="relative z-10 whitespace-pre-line flex flex-col gap-2">
            <div className="mb-1 text-sm opacity-95 font-medium">{title}</div>
            <div className="text-3xl font-bold">
                {typeof value === 'number' && isCurrency ? currencyFormat(value) : value}
            </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-12 translate-x-12 transition-transform duration-300 hover:scale-110" />
    </div>
);

const BarChartSection: React.FC<{ data: (StatsEntry & { net: number })[] }> = ({ data }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Monthly Performance</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Net Profit</span>
            </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatMonth}
                />
                <YAxis
                    tickFormatter={currencyFormat}
                    tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="net" radius={[6, 6, 0, 0]}>
                    {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[0]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
);

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload?.length) {
        const { income, orderCount, net } = payload[0].payload;
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 text-sm">
                <div className="font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100">
                    {formatMonth(label || '')}
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Income:</span>
                        <span className="text-green-600 font-semibold">{currencyFormat(income)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Orders:</span>
                        <span className="text-gray-700 font-semibold">{orderCount}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                        <span className="text-gray-600">Net:</span>
                        <span className="text-blue-600 font-bold">{currencyFormat(net)}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const OrderListSection: React.FC<{ orders: OrderItem[]; loading: boolean }> = ({ orders, loading }) => (
    <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Recent Orders</h3>
            <div className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${orders.length} orders`}
            </div>
        </div>

        {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center">
                    <div className="inline-flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-4 h-4 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-gray-500 mt-4">Loading orders...</p>
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                    <div>Order ID</div>
                    <div>Date</div>
                    <div>Customer</div>
                    <div>Total</div>
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
                                className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-150 animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="font-medium text-blue-600">#{order.id}</div>
                                <div className="text-gray-500">{order.date}</div>
                                <div className="text-gray-800 font-medium">{order.customer}</div>
                                <div className="text-green-600 font-bold">{currencyFormat(order.total)}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
    </div>
);

export default AdminFinanceReport;

<style>{`
@keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in-up {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
}

.animate-slide-up {
    animation: slide-up 0.6s ease-out forwards;
}

.animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
}
`}</style>