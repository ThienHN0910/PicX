import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { TextArea } from '../components/ui/TextArea';
import { useStore } from '../lib/store';
import { ArtistProfileData } from '../types/ArtistProfileData';

interface ArtistProfileFormProps {
    initialData: ArtistProfileData;
    onSave: (data: ArtistProfileData) => void;
    onCancel: () => void;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ArtistProfileForm: React.FC<ArtistProfileFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<ArtistProfileData>(initialData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly
                    />
                </div>

                <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label htmlFor="bio">Bio</Label>
                    <TextArea
                        id="bio"
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleChange}
                        rows={4}
                    />
                </div>

                <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                        id="specialization"
                        name="specialization"
                        value={formData.specialization || ''}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input
                        id="experienceYears"
                        name="experienceYears"
                        type="number"
                        value={formData.experienceYears || ''}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                        id="websiteUrl"
                        name="websiteUrl"
                        type="url"
                        value={formData.websiteUrl || ''}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary">
                    Save Changes
                </Button>
            </div>
        </form>
    );
};

// Main ArtistProfile Component
const ArtistProfile: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const { user } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!id && user?.id) {
            navigate(`/profile/artist/${user.id}`, { replace: true });
        }
    }, [id, user, navigate]);

    const isOwner = user?.id == Number(id);
    const [isEditing, setIsEditing] = useState(isOwner);
    const [profileData, setProfileData] = useState<ArtistProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getAuthHeader = () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/profile/artist/${id}`, {
                    headers: getAuthHeader()
                });
                setProfileData(response.data);
                setError('');
            } catch (err) {
                setError('Failed to load artist profile.');
                console.error('Error fetching artist profile:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProfile();
        }
    }, [id, user]);

    const handleSave = async (updatedData: ArtistProfileData) => {
        try {
            await axios.put(`${API_BASE_URL}/api/profile/artist`, updatedData, {
                headers: getAuthHeader()
            });
            setProfileData(updatedData);
            setIsEditing(false);
            setError('');
        } catch (err) {
            setError('Failed to update profile.');
            console.error('Error updating profile:', err);
        }
    };

    useEffect(() => {
        setIsEditing(isOwner);
    }, [id, user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                <p>{error}</p>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="text-center p-4">
                <p>Artist profile not found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-0 md:p-0 overflow-hidden border border-gray-200">
                
                {/* Main Content */}
                <div className="pt-24 pb-10 px-6 md:px-16">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">{profileData.name}</h1>
                            <div className="flex items-center gap-2 text-gray-500 text-lg">
                                <span className="font-medium">{profileData.specialization}</span>
                                {profileData.websiteUrl && (
                                    <a
                                        href={profileData.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-500 hover:underline text-base"
                                    >
                                        Website
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {user?.role === 'artist' && isOwner && !isEditing && (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    variant="primary"
                                    className="rounded-full px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white shadow-md font-semibold"
                                >
                                    Edit Profile
                                </Button>
                            )}
                            {user?.role === 'artist' && isOwner && isEditing && (
                                <Button
                                    onClick={() => setIsEditing(false)}
                                    variant="outline"
                                    className="rounded-full px-6 py-2 border-pink-500 text-pink-500 hover:bg-pink-50 shadow-md font-semibold"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-lg p-8 border border-gray-100">
                            <ArtistProfileForm
                                initialData={profileData}
                                onSave={handleSave}
                                onCancel={() => setIsEditing(false)}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* Left: Basic Info & Artist Info */}
                            <div className="md:col-span-1 space-y-8">
                                <div className="bg-white/80 rounded-xl shadow p-6 border border-gray-100">
                                    <h2 className="text-xl font-bold mb-4 text-pink-600">Basic Information</h2>
                                    <div className="mb-2">
                                        <Label className="text-gray-500">Name</Label>
                                        <p className="font-medium text-lg">{profileData.name}</p>
                                    </div>
                                    <div className="mb-2">
                                        <Label className="text-gray-500">Email</Label>
                                        <p className="font-medium text-lg">{profileData.email}</p>
                                    </div>
                                    {profileData.phone && (
                                        <div className="mb-2">
                                            <Label className="text-gray-500">Phone</Label>
                                            <p className="font-medium text-lg">{profileData.phone}</p>
                                        </div>
                                    )}
                                    {profileData.address && (
                                        <div className="mb-2">
                                            <Label className="text-gray-500">Address</Label>
                                            <p className="font-medium text-lg">{profileData.address}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white/80 rounded-xl shadow p-6 border border-gray-100">
                                    <h2 className="text-xl font-bold mb-4 text-purple-600">Artist Information</h2>
                                    <div className="mb-2">
                                        <Label className="text-gray-500">Specialization</Label>
                                        <p className="font-medium text-lg">{profileData.specialization}</p>
                                    </div>
                                    <div className="mb-2">
                                        <Label className="text-gray-500">Experience</Label>
                                        <p className="font-medium text-lg">{profileData.experienceYears} years</p>
                                    </div>
                                    {profileData.websiteUrl && (
                                        <div className="mb-2">
                                            <a
                                                href={profileData.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-base"
                                            >
                                                {profileData.websiteUrl}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Center: Bio */}
                            <div className="md:col-span-2 flex flex-col gap-8">
                                <div className="bg-white/80 rounded-xl shadow p-8 border border-gray-100 min-h-[180px]">
                                    <h2 className="text-xl font-bold mb-4 text-blue-600">Bio</h2>
                                    <p className="text-gray-700 whitespace-pre-wrap text-lg">{profileData.bio}</p>
                                </div>
                                {/* Social Media Links */}
                                {profileData.socialMediaLinks && (
                                    <div className="bg-white/80 rounded-xl shadow p-8 border border-gray-100">
                                        <h2 className="text-xl font-bold mb-4 text-blue-600">Social Media</h2>
                                        <p className="text-gray-700 text-lg break-all">{profileData.socialMediaLinks}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArtistProfile;