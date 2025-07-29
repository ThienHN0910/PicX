import { useState } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export function ResetPassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validation checks
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        // Validate new password length
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        // Check if new password is different from current password
        if (currentPassword === newPassword) {
            setError('New password must be different from current password');
            return;
        }

        // Check if new password matches confirmation
        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/change-password`, {
                currentPassword,
                newPassword
            });

            setMessage('Password changed successfully. You will be logged out shortly.');

            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Log out user after successful password change
            setTimeout(() => {
                // Clear any stored authentication tokens
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Redirect to login page
                window.location.href = '/login';
            }, 2000);

        } catch (error) {
            console.error('Error changing password:', error);

            if (error.response) {
                // Server responded with error
                setError(error.response.data.message || 'Failed to change password');
            } else {
                // Network or other error
                setError('Network error. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <div style={{
                maxWidth: 450,
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(180deg, rgb(66,230,149) 0%, rgb(59,178,184) 100%)',
                        borderRadius: '50%',
                        margin: '0 auto 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        color: 'white',
                        boxShadow: '0 10px 20px rgba(66,230,149,0.3)'
                    }}>
                        🔒
                    </div>
                    <h2 style={{
                        margin: '0',
                        color: '#333',
                        fontSize: '28px',
                        fontWeight: '600',
                        background: 'linear-gradient(180deg, rgb(66,230,149) 0%, rgb(59,178,184) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>Change Password</h2>
                    <p style={{
                        color: '#666',
                        margin: '10px 0 0 0',
                        fontSize: '14px'
                    }}>Update your password to keep your account secure</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="password"
                            placeholder="Current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '15px 20px',
                                border: '2px solid #f0f0f0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                backgroundColor: '#fafafa'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgb(66,230,149)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(66,230,149,0.1)';
                                e.target.style.backgroundColor = '#fff';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#f0f0f0';
                                e.target.style.boxShadow = 'none';
                                e.target.style.backgroundColor = '#fafafa';
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="password"
                            placeholder="New password (minimum 8 characters)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength="8"
                            style={{
                                width: '100%',
                                padding: '15px 20px',
                                border: '2px solid #f0f0f0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                backgroundColor: '#fafafa'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgb(66,230,149)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(66,230,149,0.1)';
                                e.target.style.backgroundColor = '#fff';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#f0f0f0';
                                e.target.style.boxShadow = 'none';
                                e.target.style.backgroundColor = '#fafafa';
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '15px 20px',
                                border: '2px solid #f0f0f0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                backgroundColor: '#fafafa'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgb(66,230,149)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(66,230,149,0.1)';
                                e.target.style.backgroundColor = '#fff';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#f0f0f0';
                                e.target.style.boxShadow = 'none';
                                e.target.style.backgroundColor = '#fafafa';
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '15px',
                            background: isLoading ? '#ccc' : 'linear-gradient(180deg, rgb(66,230,149) 0%, rgb(59,178,184) 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: isLoading ? 'none' : '0 4px 15px rgba(66,230,149,0.3)',
                            transform: isLoading ? 'none' : 'translateY(0px)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(66,230,149,0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.target.style.transform = 'translateY(0px)';
                                e.target.style.boxShadow = '0 4px 15px rgba(66,230,149,0.3)';
                            }
                        }}
                    >
                        {isLoading ? (
                            <span>
                                <span style={{
                                    display: 'inline-block',
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid #ffffff',
                                    borderRadius: '50%',
                                    borderTopColor: 'transparent',
                                    animation: 'spin 1s linear infinite',
                                    marginRight: '10px'
                                }}></span>
                                Changing Password...
                            </span>
                        ) : (
                            'Change Password'
                        )}
                    </button>
                </form>

                {error && (
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        borderRadius: '12px',
                        color: '#d32f2f',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <span style={{ marginRight: '10px', fontSize: '16px' }}>⚠️</span>
                        {error}
                    </div>
                )}

                {message && (
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        borderRadius: '12px',
                        color: '#388e3c',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <span style={{ marginRight: '10px', fontSize: '16px' }}>✅</span>
                        {message}
                    </div>
                )}

                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}