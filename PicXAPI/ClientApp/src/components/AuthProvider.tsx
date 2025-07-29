import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useStore } from '../lib/store';
import { User } from '../lib/types'; // Assuming you have a User type defined in your types folder

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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [initialized, setInitialized] = useState<boolean>(false);
    const { user, setUser } = useStore();

    useEffect(() => {
        let lastToken = localStorage.getItem("authToken");

        const checkAuthStatus = async (token: string | null): Promise<void> => {
            if (!token) {
                setUser(null);
                setLoading(false);
                setInitialized(true);
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                    method: 'GET',
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
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

        // Initial check
        checkAuthStatus(lastToken);

        // Listen for token changes in localStorage
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "authToken") {
                const newToken = e.newValue;
                if (newToken !== lastToken) {
                    lastToken = newToken;
                    setLoading(true);
                    setInitialized(false);
                    checkAuthStatus(newToken);
                }
            }
        };
        window.addEventListener("storage", handleStorage);

        // Listen for token changes in this tab (e.g. setItem)
        const origSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            const event = new Event('storage');
            origSetItem.apply(this, [key, value]);
            if (key === "authToken") {
                window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }));
            }
        };

        return () => {
            window.removeEventListener("storage", handleStorage);
            localStorage.setItem = origSetItem;
        };
    }, [setUser]);

    const login = async (email: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("authToken", data.token);

                if (!data.user.emailVerified) {
                    localStorage.setItem("unverifiedEmail", data.user.email);
                } else {
                    localStorage.removeItem("unverifiedEmail");
                }

                setUser(data.user);

                return { success: true };
            } else {
                return {
                    success: false,
                    message: data.message || 'Email hoặc mật khẩu không đúng',
                };
            }
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            return {
                success: false,
                message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
            };
        }
    };


    const logout = async (): Promise<void> => {
        localStorage.removeItem("authToken");
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
