import { useStore } from '../lib/store';

import ArtistFinanceReport from '../pages/ArtistFinanceReport';
import AdminFinanceReport from '../pages/AdminFinanceReport';

const Dashboard = () => {
    const { user } = useStore();

    return (
        <div className="px-8 pt-2 space-y-4"> 
            
            <div>
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
