import React from 'react';
import { BarChart3, DollarSign, TrendingUp } from 'lucide-react';

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

const ArtistFinanceReport = () => {
  const artistStats = [
    {
      title: 'Total Earnings',
      value: '$24,563.00',
      change: 10.2,
      icon: DollarSign,
    },
    {
      title: 'Artworks Sold',
      value: '45',
      change: 5.6,
      icon: BarChart3,
    },
    {
      title: 'Average Sale Price',
      value: '$545.84',
      change: 3.1,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Financial Overview</h1>
        {/* <div className="flex space-x-2">
          <select className="rounded-md border border-gray-300 px-3 py-1.5 bg-white text-sm">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
            <option>All time</option>
          </select>
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artistStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Paintings</p>
                <p className="text-sm text-gray-500">20 sales</p>
              </div>
              <p className="font-medium">$12,634.00</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Digital Art</p>
                <p className="text-sm text-gray-500">15 sales</p>
              </div>
              <p className="font-medium">$8,246.00</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Sculptures</p>
                <p className="text-sm text-gray-500">10 sales</p>
              </div>
              <p className="font-medium">$3,683.00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
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
                  id: 'TRX-2025-101',
                  artwork: 'Summer Breeze',
                  amount: 1250,
                  date: '2025-03-15',
                  status: 'completed',
                },
                {
                  id: 'TRX-2025-102',
                  artwork: 'Urban Dreams',
                  amount: 850,
                  date: '2025-03-14',
                  status: 'completed',
                },
                {
                  id: 'TRX-2025-103',
                  artwork: 'Abstract Thoughts',
                  amount: 1600,
                  date: '2025-03-14',
                  status: 'pending',
                },
                {
                  id: 'TRX-2025-104',
                  artwork: 'Ocean Waves',
                  amount: 950,
                  date: '2025-03-13',
                  status: 'completed',
                },
              ].map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.id}
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
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
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

export default ArtistFinanceReport;