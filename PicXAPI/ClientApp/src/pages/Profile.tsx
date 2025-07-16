import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, PencilLine, Save, Palette, Lock } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { User as UserType } from '../types';

const Profile = () => {
    const { user, setUser } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showRoleConfirm, setShowRoleConfirm] = useState(false);
    const [formData, setFormData] = useState<Omit<UserType, 'id' | 'is_active' | 'email_verified' | 'created_at' | 'updated_at'>>({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: user?.role || 'buyer',
        bankName: '',
        bankAccountNumber: '',
        momoNumber: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');



    const getAuthHeader = () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/user/profile', {
                    headers: getAuthHeader()
                });
                setFormData({
                    name: response.data.name || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                    address: response.data.address || '',
                    role: response.data.role || 'buyer',
                    bankName: response.data.bankName || '',
                    bankAccountNumber: response.data.bankAccountNumber || '',
                    momoNumber: response.data.momoNumber || '',
                });
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [setUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from current password');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.post('/api/auth/change-password', {
                currentPassword,
                newPassword
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage(res.data.message || 'Password changed successfully');
            setError('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Something went wrong. Please try again.');
            }
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put('/api/user/profile', formData, {
                headers: getAuthHeader()
            });
            setIsEditing(false);
            setUser({ ...(user as UserType), ...formData });
        } catch (err) {
            setError('Failed to update profile.');
        }
    };

    const handleRoleSwitch = async () => {
        try {
            const newRole = 'artist';
            const updatedData = { ...formData, role: newRole as UserType['role'] };
            await axios.put('/api/user/profile', updatedData, {
                headers: getAuthHeader()
            });
            setFormData(updatedData);
            setUser({ ...(user as UserType), ...updatedData });
            setShowRoleConfirm(false);
        } catch {
            setError('Failed to switch to artist role.');
        }
    };



    if (loading) return <p className="text-center text-gray-600">Loading profile...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="bg-indigo-200 p-3 rounded-full">
                        <User className="h-8 w-8 text-indigo-700" />
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-900">Your Profile</h1>
                </div>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    className="flex items-center space-x-2"
                >
                    {isEditing ? <><Save className="h-4 w-4" /><span>Save</span></> : <><PencilLine className="h-4 w-4" /><span>Edit</span></>}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['name', 'email', 'phone', 'address', 'bankName', 'bankAccountNumber', 'momoNumber'].map(field => (
                    <div key={field}>
                        <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
                            {field.replace(/_/g, ' ')}
                        </label>
                        <Input
                            id={field}
                            name={field}
                            value={(formData as any)[field]}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>
                ))}

                {isEditing && (
                    <div className="col-span-2 flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                )}
            </form>

            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-600" /> Change Password
                </h2>

                <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <Input
                            type="password"
                            name="currentPassword"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <Input
                            type="password"
                            name="newPassword"
                            value={newPassword}
                            minLength={8}
                            required
                            onChange={e => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <Input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            minLength={8}
                            required
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="col-span-2">
                        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                        {message && <div className="text-green-600 text-sm mb-2">{message}</div>}
                        <div className="text-right">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Changing...' : 'Change Password'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>


            {user?.role === 'buyer' && (
                <div className="bg-blue-50 p-6 rounded-lg shadow-inner">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Become an Artist</h3>
                    <p className="text-sm text-gray-700 mb-4">Switch to artist mode to start selling your artwork and build your portfolio.</p>
                    <Button onClick={() => setShowRoleConfirm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Palette className="h-4 w-4 mr-2" /> Switch to Artist
                    </Button>
                </div>
            )}

            {user?.role === 'artist' && user?.id && (
                <div className="text-center">
                    <Button onClick={() => navigate(`/profile/artist/${user.id}`)} className="bg-purple-600 hover:bg-purple-700 text-white">
                        <PencilLine className="h-4 w-4 mr-2" /> Build Your Artist Profile
                    </Button>
                </div>
            )}

            {showRoleConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Role Switch</h3>
                        <p className="text-gray-600 mb-4">Are you sure you want to become an Artist? This action is irreversible and unlocks new features.</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowRoleConfirm(false)}>Cancel</Button>
                            <Button onClick={handleRoleSwitch} className="bg-blue-600 hover:bg-blue-700 text-white">Yes, Switch</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
