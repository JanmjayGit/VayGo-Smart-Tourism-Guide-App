import { useState, useEffect } from 'react';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [allNotifs, unreadNotifs] = await Promise.all([
                axios.get(apiEndpoints.GET_NOTIFICATIONS, { headers }),
                axios.get(apiEndpoints.UNREAD_NOTIFICATIONS, { headers })
            ]);
            setNotifications(allNotifs.data);
            setUnreadCount(unreadNotifs.data.length);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(apiEndpoints.MARK_AS_READ(id), {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(apiEndpoints.MARK_ALL_AS_READ, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(notif => ({ ...notif, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications
    };
};
