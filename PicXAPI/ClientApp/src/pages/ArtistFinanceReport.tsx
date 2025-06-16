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

const StatCard = ({ title, value, change, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-xl font-bold">{value}</h3>
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? `↑ ${change}%` : `↓ ${Math.abs(change)}%`} vs last month
            </p>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
            <Icon className="h-5 w-5 text-gray-700" />
        </div>
    </div>
);

const ArtistFinanceReport = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/finance/artist-statistics')
            .then(res => setStats(res.data))
            .catch(err => console.error("API error:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-gray-500">Loading data...</p>;

    const current = stats[stats.length - 1];
    const prev = stats.length >= 2 ? stats[stats.length - 2] : null;

    const earnings = current?.income || 0;
    const expenses = current?.expense || 0;
    const netEarnings = earnings - expenses;
    const earningsChange = prev ? +((earnings - prev.income) / prev.income * 100).toFixed(1) : 0;
    const avgProfitMargin = earnings ? (((earnings - expenses) / earnings) * 100).toFixed(1) : 0;

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

            {/* Bottom layout: Left (charts) - Right (stat cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Charts */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Net Profit Margin */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-lg font-semibold mb-2">Net Profit Margin</h2>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.map(r => ({
                                    ...r,
                                    netMargin: r.income ? ((r.income - r.expense) / r.income * 100).toFixed(1) : 0
                                }))}>
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
                                <BarChart data={stats}>
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
                    <StatCard title="Total Earnings" value={`$${earnings.toLocaleString()}`} change={earningsChange} icon={DollarSign} />
                    <StatCard title="Avg Profit Margin" value={`${avgProfitMargin}%`} change={earningsChange} icon={TrendingUp} />
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
                    />
                    <StatCard title="Net Earnings" value={`$${netEarnings.toLocaleString()}`} change={earningsChange} icon={PiggyBank} />
                </div>
            </div>
        </div>
    );
};

export default ArtistFinanceReport;
