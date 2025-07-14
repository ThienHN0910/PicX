import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { getGoogleOAuthURL } from '../utils/googleOAuth';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            const unverifiedEmail = localStorage.getItem("unverifiedEmail");
            if (unverifiedEmail) {
                navigate('/verify-email');
            } else {
                navigate('/');
            }
        } else {
            setErrorMessage(result.message);
        }

        setIsLoading(false);
    };

    const handleGoogleLogin = () => {
        window.location.href = getGoogleOAuthURL();
    };

    const handleForgotPassword = () => {
        navigate("/forgot-password");
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
                <LogIn className="h-12 w-12 text-[#10d194] mx-auto" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Login</h2>
                <p className="mt-2 text-gray-600">Sign in to your account</p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-sm text-[#10d194] hover:text-[#1a9f8e]"
                            disabled={isLoading}
                        >
                            Forgot password?
                        </button>
                    </div>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        disabled={isLoading}
                    />
                </div>

                {errorMessage && <p className="text-red-600 text-sm text-center">{errorMessage}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white py-2 px-4 rounded-md focus:outline-none
                               bg-[linear-gradient(180deg,_rgb(66,230,149),_rgb(59,178,184),_rgb(66,230,149))]
                               bg-[length:100%_200%]
                               bg-top hover:bg-bottom
                               transition-all duration-500 ease-in-out
                               active:scale-90"
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#10d194] hover:text-[#1a9f8e]">
                    Register here
                </Link>
            </p>
        </div>
    );
};

export default Login;