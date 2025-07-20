import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    TooltipProps,
} from 'recharts';
import { DollarSign, TrendingUp, Star, BarChart2 } from 'lucide-react';
import Loading from '../components/Loading';

// Add currencyFormat function
const currencyFormat = (value: number): string =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

// Add this function for MM/YYYY
const formatMonthDMY = (monthString: string): string => {
    const [year, month] = monthString.split("-");
    if (!year || !month) return monthString;
    return `${month.padStart(2, '0')}/${year}`;
};

// Add this function for Month YYYY
const formatMonthText = (monthString: string): string => {
    const [year, month] = monthString.split("-");
    if (!year || !month) return monthString;
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

type FinanceData = {
    month: string;
    income: number;
};

type StatCardProps = {
    title: string;
    value: string;
    icon: React.ElementType;
    gradient: string;
    description?: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, gradient, description }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg transition-transform hover:scale-105`}>
        <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-white opacity-90" />
                <span className="text-sm font-medium opacity-95">{title}</span>
            </div>
            <h3 className="text-3xl font-bold">{value}</h3>
            {description && <p className="text-sm opacity-85">{description}</p>}
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-12 translate-x-12"></div>
    </div>
);

const ArtistFinanceReport: React.FC = () => {
    const [stats, setStats] = useState<FinanceData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        setLoading(true);
        axios
            .get('/api/finance/artist-statistics', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setStats(res.data))
            .catch((err) => console.error('Finance API error:', err))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <Loading />;
    if (!stats.length) {
        return (
            <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No financial data available.</p>
            </div>
        );
    }

    // Stat calculations
    const totalEarnings = stats.reduce((sum, s) => sum + (s.income ?? 0), 0);
    const latest = stats.length > 0 ? stats[stats.length - 1] : null;
    const prev = stats.length >= 2 ? stats[stats.length - 2] : null;
    const best = stats.length > 0 ? stats.reduce((max, s) => (s.income > max.income ? s : max), stats[0]) : null;
    const trend = prev && latest && prev.income !== 0 ? +(((latest.income - prev.income) / prev.income) * 100).toFixed(1) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Artist Finance Dashboard</h1>
                    <p className="text-gray-600">Track your earnings and performance over time</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Earnings"
                        value={currencyFormat(totalEarnings)}
                        icon={DollarSign}
                        gradient="from-[rgb(66,230,149)] to-[rgb(59,178,184)]"
                        description="All-time total revenue"
                    />
                    <StatCard
                        title="Latest Month"
                        value={latest ? currencyFormat(latest.income) : 'N/A'}
                        icon={BarChart2}
                        gradient="from-[rgb(66,230,149)] to-[rgb(59,178,184)]"
                        description={latest ? `Earnings for ${formatMonthText(latest.month)}.` : 'N/A'}
                    />
                    <StatCard
                        title="Best Month"
                        value={best ? currencyFormat(best.income) : 'N/A'}
                        icon={Star}
                        gradient="from-[rgb(66,230,149)] to-[rgb(59,178,184)]"
                        description={best ? `Highest-earning month: ${formatMonthText(best.month)}` : 'N/A'}
                    />
                    <StatCard
                        title="Trend"
                        value={trend === null ? 'N/A' : `${trend > 0 ? '+' : ''}${trend}%`}
                        icon={TrendingUp}
                        gradient="from-[rgb(66,230,149)] to-[rgb(59,178,184)]"
                        description="Month-over-month change."
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Earnings Trend (Area Chart) - 3/4 width */}
                    <div className="bg-white rounded-xl shadow-lg p-6 xl:col-span-3 flex flex-col justify-center">
                        <div className="mb-4 flex justify-center">
                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                Earnings Trend
                            </h2>
                        </div>
                        <div className="h-72 flex items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={stats}
                                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                                >
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#42e695" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3bb2b8" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="month"
                                        tickFormatter={formatMonthDMY}
                                        interval={0}
                                        tick={{ dy: 12 }}
                                    />
                                    <YAxis tickFormatter={currencyFormat} />
                                    <Tooltip content={({ active, payload, label }: TooltipProps<number, string>) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white p-3 rounded-lg shadow-lg border text-gray-800 text-sm">
                                                    <div className="space-y-1">
                                                        <div>
                                                            <strong>Period:</strong> {formatMonthDMY(label)}
                                                        </div>
                                                        <div>
                                                            <strong>Earnings:</strong> {currencyFormat(payload[0].value as number)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }} />
                                    <Area
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#42e695"
                                        fill="url(#colorIncome)"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: "#3bb2b8" }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Earnings Table - 1/4 width */}
                    <div className="bg-white rounded-xl shadow-lg p-6 xl:col-span-1 flex flex-col justify-center">
                        <div className="mb-4 flex justify-center">
                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                Monthly Earnings
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-center">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2">Month</th>
                                        <th className="px-4 py-2">Earnings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.map((s, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2">{formatMonthDMY(s.month)}</td>
                                            <td className="px-4 py-2">{currencyFormat(s.income)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistFinanceReport;