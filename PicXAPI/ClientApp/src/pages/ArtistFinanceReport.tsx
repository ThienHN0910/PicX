import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    Legend,
    TooltipProps,
} from 'recharts';
import { DollarSign, TrendingUp, Star, BarChart2 } from 'lucide-react';
import Loading from '../components/Loading';

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

const COLORS = ['#3b82f6', '#1d4ed8', '#60a5fa', '#93c5fd', '#dbeafe', '#f59e0b', '#d97706', '#92400e'];

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

type PieLabelRenderProps = {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
};

const renderPieLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            fontWeight={600}
        >
            {`${(percent * 100).toFixed(1)}%`}
        </text>
    );
};

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

    const pieData = stats.map((s) => ({
        name: s.month,
        value: s.income,
        totalValue: totalEarnings,
    }));

    const renderCustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border text-gray-800 text-sm">
                    <div className="space-y-1">
                        <div>
                            <strong>Period:</strong> {label}
                        </div>
                        <div>
                            <strong>Earnings:</strong> ${payload[0].value?.toLocaleString()}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderCustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border text-gray-800 text-sm">
                    <div className="space-y-1">
                        <div>
                            <strong>Period:</strong> {data.name}
                        </div>
                        <div>
                            <strong>Earnings:</strong> ${data.value?.toLocaleString()}
                        </div>
                        <div>
                            <strong>Percentage:</strong>{' '}
                            {((data.value && data.payload?.totalValue) ? ((data.value / data.payload.totalValue) * 100).toFixed(1) : '0')}%
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

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
                        value={`$${totalEarnings.toLocaleString()}`}
                        icon={DollarSign}
                        gradient="from-blue-500 to-blue-600"
                        description="All-time total revenue"
                    />
                    <StatCard
                        title="Latest Month"
                        value={latest ? `$${latest.income.toLocaleString()}` : 'N/A'}
                        icon={BarChart2}
                        gradient="from-blue-600 to-blue-700"
                        description={latest ? `Earnings for ${latest.month}.` : 'N/A'}
                    />
                    <StatCard
                        title="Best Month"
                        value={best ? `$${best.income.toLocaleString()}` : 'N/A'}
                        icon={Star}
                        gradient="from-amber-500 to-amber-600"
                        description={best ? `Highest-earning month: ${best.month}` : 'N/A'}
                    />
                    <StatCard
                        title="Trend"
                        value={trend === null ? 'N/A' : `${trend > 0 ? '+' : ''}${trend}%`}
                        icon={TrendingUp}
                        gradient="from-emerald-500 to-emerald-600"
                        description="Month-over-month change."
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                Earnings Trend
                            </h2>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={stats}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#dbeafe" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <Tooltip content={renderCustomTooltip} />
                                    <Area
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#3b82f6"
                                        fill="url(#colorIncome)"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: "#3b82f6" }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Monthly Distribution
                            </h2>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="45%"
                                        outerRadius={100}
                                        innerRadius={60}
                                        label={renderPieLabel}
                                        labelLine={false}
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={renderCustomPieTooltip} />
                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="circle"
                                        wrapperStyle={{ paddingTop: '20px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Monthly Distribution
                        </h2>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip content={renderCustomTooltip} />
                                <Bar dataKey="income" radius={[6, 6, 0, 0]}>
                                    {stats.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistFinanceReport;