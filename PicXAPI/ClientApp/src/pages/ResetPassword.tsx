import { useState, useEffect } from 'react';
import axios from 'axios';

export function ResetPassword() {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    // Lấy email từ URL query ?email=...
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const emailParam = queryParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/reset-password', {
                email,
                newPassword
            });
            setMessage(response.data);
        } catch (error) {
            setMessage(error.response?.data || 'Something went wrong');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '60px auto', textAlign: 'center' }}>
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    disabled
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                <button type="submit" style={{ width: '100%', padding: '10px' }}>
                    Change Password
                </button>
            </form>
            {message && <p style={{ marginTop: '20px' }}>{message}</p>}
        </div>
    );
}
