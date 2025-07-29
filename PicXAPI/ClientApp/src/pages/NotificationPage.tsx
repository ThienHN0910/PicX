import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Notification {
    notificationId: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const NotificationPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`${API_BASE_URL}/api/notification/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(res.data);
            } catch {
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>
            {loading ? (
                <div>Loading...</div>
            ) : notifications.length === 0 ? (
                <div className="text-gray-500">No notifications.</div>
            ) : (
                <ul className="space-y-4">
                    {notifications.map(n => (
                        <li key={n.notificationId} className={`p-4 rounded shadow ${n.isRead ? 'bg-gray-100' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
                            <div className="font-semibold">{n.title}</div>
                            <div className="text-gray-700">{n.message}</div>
                            <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationPage;
