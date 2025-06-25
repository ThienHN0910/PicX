import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, UserX, UserCheck, Users } from 'lucide-react';
import { Input } from '../components/ui/Input';

type User = {
    userId: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    joined: string;
};

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Helper to get auth header
    const getAuthHeader = () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/user/all', {
                headers: getAuthHeader()
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (userId: number, action: 'ban' | 'activate') => {
        const confirmMsg =
            action === 'ban'
                ? 'Are you sure you want to ban this user?'
                : 'Are you sure you want to activate this user again?';
        if (!confirm(confirmMsg)) return;

        try {
            await axios.put(`/api/user/${action}/${userId}`, {}, {
                headers: getAuthHeader()
            });
            fetchUsers();
        } catch (err) {
            console.error(`Failed to ${action} user:`, err);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line
    }, []);

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by email"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-2/5">User</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">Role</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">Joined</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-[5%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                <span className={`w-2 h-2 mr-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {user.isActive ? 'active' : 'banned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                                            {new Date(user.joined).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.isActive ? (
                                                <button
                                                    onClick={() => toggleStatus(user.userId, 'ban')}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <UserX className="h-5 w-5" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => toggleStatus(user.userId, 'activate')}
                                                    className="text-green-500 hover:text-green-700"
                                                >
                                                    <UserCheck className="h-5 w-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserList;
