import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar
} from 'recharts';
import { DollarSign, TrendingUp, LineChart, PiggyBank } from 'lucide-react';
import Loading from '../components/Loading';

type FinanceData = {
    month: string;
    income: number;
    expense: number;
    netEarnings?: number;
};

type StatCardProps = {
    title: string;
    value: string;
    change: number;
    icon: React.ElementType;
    gradient: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, gradient }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-md`}>
        <div className="relative z-10 flex justify-between items-center">
            <div>
                <p className="text-sm opacity-90">{title}</p>
                <h3 className="text-xl font-bold">{value}</h3>
                <p className={`text-sm ${change >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                    {change >= 0 ? `↑ ${change}%` : `↓ ${Math.abs(change)}%`} vs last month
                </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Icon className="h-5 w-5 text-white" />
            </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
    </div>
);

const ArtistFinanceReport: React.FC = () => {
    const [stats, setStats] = useState<FinanceData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        axios.get('/api/finance/artist-statistics', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => setStats(res.data))
            .catch(err => console.error("API error:", err))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <Loading />;

    if (!stats || stats.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No financial data available.</p>
            </div>
        );
    }

    const current = stats[stats.length - 1];
    const prev = stats.length >= 2 ? stats[stats.length - 2] : null;

    const earnings = current?.income ?? 0;
    const expenses = current?.expense ?? 0;
    const netEarnings = earnings - expenses;
    const earningsChange = prev && prev.income !== 0
        ? +((earnings - prev.income) / prev.income * 100).toFixed(1)
        : 0;
    const avgProfitMargin = earnings
        ? (((earnings - expenses) / earnings) * 100).toFixed(1)
        : '0';

    return (
        <div className="space-y-6">
            {/* Earnings Overview */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Earnings Overview</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="income" stroke="#4ade80" fill="#bbf7d0" />
                            <Area type="monotone" dataKey="expense" stroke="#f87171" fill="#fecaca" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom layout: charts + stat cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Charts */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Net Profit Margin */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-lg font-semibold mb-2">Net Profit Margin</h2>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.map((r) => ({
                                    ...r,
                                    netMargin: r.income ? ((r.income - r.expense) / r.income * 100).toFixed(1) : '0'
                                }))} barSize={50}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="netMargin" fill="#60a5fa" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Expenses */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-lg font-semibold mb-2">Expenses</h2>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats} barSize={50}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="expense" fill="#facc15" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right: Stat Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        title="Total Earnings"
                        value={`$${earnings.toLocaleString()}`}
                        change={earningsChange}
                        icon={DollarSign}
                        gradient="from-indigo-400 to-indigo-600"
                    />
                    <StatCard
                        title="Avg Profit Margin"
                        value={`${avgProfitMargin}%`}
                        change={earningsChange}
                        icon={TrendingUp}
                        gradient="from-green-400 to-emerald-500"
                    />
                    <StatCard
                        title="Trend"
                        value={
                            Math.abs(earningsChange) < 1
                                ? 'Stable'
                                : earningsChange > 0
                                    ? 'Upward'
                                    : 'Downward'
                        }
                        change={earningsChange}
                        icon={LineChart}
                        gradient="from-blue-400 to-blue-600"
                    />
                    <StatCard
                        title="Net Earnings"
                        value={`$${netEarnings.toLocaleString()}`}
                        change={earningsChange}
                        icon={PiggyBank}
                        gradient="from-pink-400 to-pink-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default ArtistFinanceReport;
