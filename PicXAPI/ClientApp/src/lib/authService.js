export const authService = {
    // Lấy token từ localStorage
    getToken() {
        return localStorage.getItem("authToken");
    },
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Kiểm tra xem user có đang đăng nhập không
    async checkAuth() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
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
        localStorage.removeItem("authToken");
        return true;
    },

    // Wrapper cho fetch có token
    async authenticatedFetch(url, options = {}) {
        const token = this.getToken();
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options
        };

        return fetch(url, defaultOptions);
    }
};
