import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, PencilLine, Save } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useStore } from '../lib/store';

const Profile = () => {
    const { user, setUser } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/user/profile', { withCredentials: true });
                setFormData({
                    name: response.data.name || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                    address: response.data.address || '',
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
            await axios.put('/api/user/profile', formData, { withCredentials: true });
            setIsEditing(false);
            setUser(formData);
        } catch (err) {
            console.error('Failed to update profile', err);
            setError('Failed to update profile.');
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
                </form>
            </div>
        );
    };

    export default Profile;