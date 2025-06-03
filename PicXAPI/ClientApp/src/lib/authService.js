// lib/authService.js
export const authService = {
    // Kiểm tra xem user có đang đăng nhập không
    async checkAuth() {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include', // Gửi cookie
            });

            if (response.ok) {
                const data = await response.json();
                return data.user;
            }
            return null;
        } catch (error) {
            console.error('Lỗi khi kiểm tra auth:', error);
            return null;
        }
    },

    // Đăng xuất
    async logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            return response.ok;
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            return false;
        }
    },

    // Tạo một wrapper cho fetch để tự động include credentials
    async authenticatedFetch(url, options = {}) {
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        return fetch(url, { ...defaultOptions, ...options });
    }
};

// Hook để sử dụng trong component
import { useEffect, useState } from 'react';
import { useStore } from './store';

export const useAuth = () => {
    const [loading, setLoading] = useState(true);
    const { user, setUser } = useStore();

    useEffect(() => {
        const checkAuthStatus = async () => {
            if (!user) {
                const currentUser = await authService.checkAuth();
                if (currentUser) {
                    setUser(currentUser);
                }
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, [user, setUser]);

    const logout = async () => {
        const success = await authService.logout();
        if (success) {
            setUser(null);
        }
        return success;
    };

    return {
        user,
        loading,
        logout,
        isAuthenticated: !!user
    };
};