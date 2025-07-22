import React from 'react';
import { BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}% from last month
        </p>
      </div>
      <div className="p-3 bg-indigo-100 rounded-full">
        <Icon className="h-6 w-6 text-indigo-600" />
      </div>
    </div>
  </div>
);

const Finance = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$124,563.00',
      change: 12.5,
      icon: DollarSign
    },
    {
      title: 'Active Artists',
      value: '245',
      change: 8.2,
      icon: Users
    },
    {
      title: 'Sales Volume',
      value: '1,234',
      change: -2.4,
      icon: BarChart3
    },
    {
      title: 'Average Sale',
      value: '$284.35',
      change: 4.7,
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6 ml-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        {/* <div className="flex space-x-2">
          <select className="rounded-md border border-gray-300 px-3 py-1.5 bg-white text-sm">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
            <option>All time</option>
          </select>
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Paintings</p>
                <p className="text-sm text-gray-500">486 sales</p>
              </div>
              <p className="font-medium">$52,634.00</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Digital Art</p>
                <p className="text-sm text-gray-500">324 sales</p>
              </div>
              <p className="font-medium">$38,246.00</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Photography</p>
                <p className="text-sm text-gray-500">264 sales</p>
              </div>
              <p className="font-medium">$21,425.00</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Sculptures</p>
                <p className="text-sm text-gray-500">160 sales</p>
              </div>
              <p className="font-medium">$12,258.00</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Artists</h2>
          <div className="space-y-4">
            {[
              { name: 'Sarah Johnson', sales: 86, revenue: 12460 },
              { name: 'Michael Chen', sales: 74, revenue: 10280 },
              { name: 'Emma Davis', sales: 68, revenue: 9340 },
              { name: 'James Wilson', sales: 62, revenue: 8150 },
              { name: 'Lisa Anderson', sales: 54, revenue: 7620 }
            ].map((artist) => (
              <div key={artist.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div>
                    <p className="font-medium">{artist.name}</p>
                    <p className="text-sm text-gray-500">{artist.sales} sales</p>
                  </div>
                </div>
                <p className="font-medium">${artist.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artwork
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  id: 'TRX-2025-001',
                  artist: 'Sarah Johnson',
                  artwork: 'Summer Breeze',
                  amount: 1250,
                  date: '2025-03-15',
                  status: 'completed'
                },
                {
                  id: 'TRX-2025-002',
                  artist: 'Michael Chen',
                  artwork: 'Urban Dreams',
                  amount: 850,
                  date: '2025-03-14',
                  status: 'completed'
                },
                {
                  id: 'TRX-2025-003',
                  artist: 'Emma Davis',
                  artwork: 'Abstract Thoughts',
                  amount: 1600,
                  date: '2025-03-14',
                  status: 'pending'
                },
                {
                  id: 'TRX-2025-004',
                  artist: 'James Wilson',
                  artwork: 'Mountain Vista',
                  amount: 950,
                  date: '2025-03-13',
                  status: 'completed'
                },
                {
                  id: 'TRX-2025-005',
                  artist: 'Lisa Anderson',
                  artwork: 'Ocean Waves',
                  amount: 1100,
                  date: '2025-03-13',
                  status: 'completed'
                }
              ].map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.artist}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.artwork}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;