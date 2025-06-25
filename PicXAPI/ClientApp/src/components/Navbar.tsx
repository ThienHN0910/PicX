import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Palette, LogIn, UserPlus, ShoppingCart, MessageSquare, User } from 'lucide-react';

const Navbar = () => {
    const user = useStore(state => state.user);
    const cart = useStore(state => state.cart);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const setUser = useStore((state) => state.setUser);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
        console.log(user)
    };
    const handleLogout = async () => {
        try {
            // Xóa token trong localStorage
            localStorage.removeItem('authToken');

            // Xóa user khỏi store
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        }
        setIsDropdownOpen(false);
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <Palette className="h-8 w-8 text-indigo-600" />
                        <span className="text-xl font-bold text-gray-800">PicX</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {['buyer', 'artist'].includes(user.role) && (
                                    <>
                                        <Link to="/cart" className="relative cursor-pointer">
                                            <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
                                            {cart.length > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {cart.length}
                                                </span>
                                            )}
                                        </Link>
                                        <Link to="/chat" className="cursor-pointer">
                                            <MessageSquare className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
                                        </Link>
                                    </>
                                )}
                                <div className="relative">
                                    <button
                                        onClick={toggleDropdown}
                                        className="flex items-center space-x-1 hover:text-indigo-600 focus:outline-none"
                                    >
                                        <User className="h-6 w-6 text-gray-600" />
                                        <span className="text-gray-600">{user.name}</span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className={`absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-200 ${isDropdownOpen ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform -translate-y-2'}`}>

                                        {/* Common to all users */}
                                        <Link to="/profile" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors">
                                            Profile
                                        </Link>
                                        <Link to="/favorite" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors">
                                            Favorite Picture
                                        </Link>

                                        {/* Buyer-specific */}
                                        {user.role === 'buyer' && (
                                            <Link to="/orders" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors">
                                                View Orders
                                            </Link>
                                        )}
                                         {['artist'].includes(user.role) && (
                                            <>
                                                <Link to="/products" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors">
                                                    Manage Products
                                                </Link>
                                            </>
                                        )}
                                        {/* Artist & Admin */}
                                        {['artist', 'admin'].includes(user.role) && (
                                            <>
                                                <Link to="/dashboard" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors">
                                                    Finance Reports
                                                </Link>
                                            </>
                                        )}

                                        {/* Admin-only */}
                                        {user.role === 'admin' && (
                                            <>
                                                <Link to="/users" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors">
                                                    User List
                                                </Link>
                                            </>
                                        )}

                                        <hr className="my-1 border-gray-200" />
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 cursor-pointer">
                                    <LogIn className="h-5 w-5" />
                                    <span>Login</span>
                                </Link>
                                <Link to="/register" className="flex items-center space-x-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer">
                                    <UserPlus className="h-5 w-5" />
                                    <span>Register</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
    
};

export default Navbar;