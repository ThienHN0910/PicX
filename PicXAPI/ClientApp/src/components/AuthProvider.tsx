// components/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useStore } from '../lib/store';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface LoginResponse {
    success: boolean;
    message?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<LoginResponse>;
    logout: () => Promise<void>;
    loading: boolean;
    isAuthenticated: boolean;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext < AuthContextType | undefined > (undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState < boolean > (true);
    const [initialized, setInitialized] = useState < boolean > (false);
    const { user, setUser } = useStore();

    // Kiểm tra auth status khi app khởi động
    useEffect(() => {
        const checkAuthStatus = async (): Promise<void> => {
            if (initialized) return; // Tránh gọi nhiều lần

            try {
                const response = await fetch('/api/auth/me', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    // Token không hợp lệ hoặc hết hạn
                    setUser(null);
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra auth:', error);
                setUser(null);
            } finally {
                setLoading(false);
                setInitialized(true);
            }
        };

        checkAuthStatus();
    }, [setUser, initialized]);

    const login = async (email: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                return { success: true };
            } else {
                return {
                    success: false,
                    message: data.message || 'Email hoặc mật khẩu không đúng'
                };
            }
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            return {
                success: false,
                message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
            };
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        } finally {
            setUser(null);
        }
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};