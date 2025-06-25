import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

type StatsEntry = {
    month: string;
    income: number;
    expense: number;
};

const COLORS = ['#3B82F6', '#EF4444'];

const currencyFormat = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const AdminFinanceReport: React.FC = () => {
    const [data, setData] = useState<StatsEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/finance/admin-statistics', {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });
                setData(res.data || []);
            } catch (err) {
                setError('Failed to load statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    const totalIncome = data.reduce((sum, entry) => sum + entry.income, 0);
    const totalExpense = data.reduce((sum, entry) => sum + entry.expense, 0);
    const netProfit = totalIncome - totalExpense;

    const pieData = [
        { name: 'Income', value: totalIncome },
        { name: 'Expense', value: totalExpense }
    ];

    const chartData = data.map(entry => ({
        ...entry,
        net: entry.income - entry.expense
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            const { income, expense, net } = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-md shadow border border-gray-200 text-sm space-y-1">
                    <div className="font-semibold text-gray-700">{label}</div>
                    <div className="text-green-600">Income: {currencyFormat(income)}</div>
                    <div className="text-red-600">Expense: {currencyFormat(expense)}</div>
                    <div className="text-blue-600 font-bold">Net: {currencyFormat(net)}</div>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading finance report...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard title="Total Income" value={totalIncome} color="from-green-400 to-emerald-500" trend="+12%" />
                <StatsCard title="Total Expenses" value={totalExpense} color="from-red-400 to-pink-500" trend="-4%" />
                <StatsCard title="Net Profit" value={netProfit} color="from-blue-400 to-indigo-500" trend="+5%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Monthly Profit</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={currencyFormat} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="net" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.net >= 0 ? '#60a5fa' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Income vs Expense</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                            >
                                {pieData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-6 space-y-2 text-sm">
                        {pieData.map((entry, i) => {
                            const percent = totalIncome + totalExpense > 0
                                ? Math.round((entry.value / (totalIncome + totalExpense)) * 100)
                                : 0;
                            return (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                        <span className="text-gray-600">{entry.name}</span>
                                    </div>
                                    <span className="text-gray-900 font-medium">
                                        {currencyFormat(entry.value)} ({percent}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

type StatsCardProps = {
    title: string;
    value: number;
    color: string;
    trend: string;
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, color, trend }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${color} rounded-2xl p-6 text-white`}>
        <div className="relative z-10">
            <div className="mb-1 text-sm opacity-80">{title}</div>
            <div className="text-3xl font-bold">{currencyFormat(value)}</div>
            <div className="text-sm opacity-90">Trend: {trend}</div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full transform -translate-y-16 translate-x-16" />
    </div>
);

export default AdminFinanceReport;
