import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, PencilLine, Save, Palette } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, setUser } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showRoleConfirm, setShowRoleConfirm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: user?.role || 'buyer',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Helper to get auth header
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put('/api/user/profile', formData, {
                headers: getAuthHeader()
            });
            setIsEditing(false);
            setUser(formData);
        } catch (err) {
            console.error('Failed to update profile', err);
            setError('Failed to update profile.');
        }
    };

    const handleRoleSwitch = async () => {
        try {
            const newRole = 'artist';
            const updatedData = { ...formData, role: newRole };

            await axios.put('/api/user/profile', updatedData, {
                headers: getAuthHeader()
            });
            setFormData(updatedData);
            setUser(updatedData);
            setShowRoleConfirm(false);
            setError('');
        } catch (err) {
            console.error('Failed to switch role', err);
            setError('Failed to switch to artist role.');
        }
    };

    if (loading) return <p className="text-center">Loading profile...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        <User className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                </div>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    className="flex items-center space-x-2"
                >
                    {isEditing ? (
                        <>
                            <Save className="h-4 w-4" />
                            <span>Save</span>
                        </>
                    ) : (
                        <>
                            <PencilLine className="h-4 w-4" />
                            <span>Edit</span>
                        </>
                    )}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                    </label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                    />
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address
                    </label>
                    <Input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Current Role
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <span className="capitalize font-medium text-gray-900">
                            {formData.role}
                        </span>
                    </div>
                </div>

                {isEditing && (
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </div>
                )}

                {/* Role Switch Section - Only show for buyers */}
                {user?.role === 'buyer' && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Become an Artist
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Switch to artist mode to start selling your artwork and manage your portfolio.
                            </p>
                            <Button
                                type="button"
                                onClick={() => setShowRoleConfirm(true)}
                                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                            >
                                <Palette className="h-4 w-4" />
                                <span>Switch to Artist</span>
                            </Button>
                        </div>
                    </div>
                )}
                {user?.role === 'artist' && user?.id && (
                    <div className="mt-6 text-center md:text-left">
                        <Button
                            onClick={() => navigate(`/profile/artist/${user.id}`)}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
                        >
                            <PencilLine className="h-5 w-5 mr-2" />
                            Build Your Artist Profile
                        </Button>
                    </div>
                )}
            </form>

            {/* Confirmation Modal */}
            {showRoleConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-mx-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <Palette className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Confirm Role Switch
                            </h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to switch to Artist mode? This will give you access to 
                            artist features like portfolio management and artwork sales.
                        </p>
                        
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowRoleConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleRoleSwitch}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Yes, Switch to Artist
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;