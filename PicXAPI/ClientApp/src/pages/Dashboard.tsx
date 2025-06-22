import React from 'react';
import { useStore } from '../lib/store';

import ArtistFinanceReport from '../pages/ArtistFinanceReport';
import AdminFinanceReport from '../pages/AdminFinanceReport';

const Dashboard = () => {
    const { user } = useStore();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Finances Report</h1>
            </div>

            <div className="space-y-6">
                {user?.role === 'admin' ? (
                    <AdminFinanceReport />
                ) : user?.role === 'artist' ? (
                    <ArtistFinanceReport />
                ) : (
                    <p className="text-gray-500">No Report available for this role.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
