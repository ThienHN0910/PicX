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

type TooltipProps = {
    active?: boolean;
    payload?: {
        payload: StatsEntry & { net: number };
    }[];
    label?: string;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const AdminFinanceReport: React.FC = () => {
    const [data, setData] = useState<StatsEntry[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/finance/admin-statistics', { withCredentials: true });
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch admin statistics', err);
            }
        };

        fetchStats();
    }, []);

    const totalIncome = data.reduce((sum, entry) => sum + entry.income, 0);
    const totalExpense = data.reduce((sum, entry) => sum + entry.expense, 0);

    const pieData = [
        { name: 'Income', value: totalIncome },
        { name: 'Expense', value: totalExpense }
    ];

    const chartData = data.map(entry => ({
        ...entry,
        net: entry.income - entry.expense
    }));

    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
        if (active && payload?.length) {
            const { income, expense, net } = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">{`Month: ${label}`}</p>
                    <p className="text-sm text-green-600">{`Income: $${income.toLocaleString()}`}</p>
                    <p className="text-sm text-red-600">{`Expense: $${expense.toLocaleString()}`}</p>
                    <p className="text-sm font-bold text-blue-600">{`Net Profit: $${net.toLocaleString()}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard title="Total Income" value={totalIncome} color="from-orange-400 to-pink-500" trend="60%" />
                <StatsCard title="Total Expenses" value={totalExpense} color="from-blue-400 to-blue-600" trend="-10%" />
                <StatsCard title="Net Profit" value={totalIncome - totalExpense} color="from-green-400 to-emerald-500" trend="+5%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Monthly Profit</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>
                            <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="net" radius={[8, 8, 0, 0]}>
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.net >= 0 ? '#60a5fa' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

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
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="mt-6 space-y-3">
                        {pieData.map((entry, i) => {
                            const percent = totalIncome + totalExpense > 0
                                ? Math.round((entry.value / (totalIncome + totalExpense)) * 100)
                                : 0;
                            return (
                                <div key={i} className="flex justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-sm text-gray-600">{entry.name}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">${entry.value.toLocaleString()} ({percent}%)</span>
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
            <div className="flex justify-between mb-2">
                <span className="text-sm opacity-90">{title}</span>
            </div>
            <div className="text-3xl font-bold mb-2">${value.toLocaleString()}</div>
            <div className="text-sm opacity-90">Trend: {trend}</div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
    </div>
);

export default AdminFinanceReport;
