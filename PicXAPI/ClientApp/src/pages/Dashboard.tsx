import React from 'react';
import { useStore } from '../lib/store';

import ArtistFinanceReport from '../pages/ArtistFinanceReport';


const Dashboard = () => {
    const { user } = useStore();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name || 'User'}</p>
            </div>

           
            <div className="space-y-6">
                { user?.role === 'artist' ? (
                    <ArtistFinanceReport />
                ) : (
                    <p className="text-gray-500"> </p>
                )}

            </div>
        </div>
    );
};

export default Dashboard;
