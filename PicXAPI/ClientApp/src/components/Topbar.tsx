import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/Input';
import { Search, LogIn, UserPlus } from 'lucide-react';
import { useStore } from '../lib/store';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function Topbar() {
    const { user, searchQuery, setSearchQuery } = useStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Đăng xuất qua API
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (err) {
            // ignore
        } finally {
            localStorage.removeItem('authToken');
            navigate('/login');
            window.location.reload();
        }
    };

    return (
        <div className="sticky top-0 z-10 bg-gray-50 flex items-center px-8 py-3">
            <div className="flex-1 flex items-center !w-full">
                <div className="relative w-full">
                    <Input
                        type="text"
                        placeholder="Search..."
                        className="h-12 w-full pl-10 pr-4 py-2 border-none bg-gray-200"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 self-center text-gray-600 mr-2" />
                </div>
            </div>


            <div className="ml-6 relative" ref={dropdownRef}>
                {user && user.role !== 'guest' ? (
                    <>
                        <button
                            className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-lg font-bold text-white focus:outline-none"
                            onClick={() => setIsDropdownOpen(v => !v)}
                        >
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </button>
                        <div className={`absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-200 ${isDropdownOpen ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform -translate-y-2'}`}>
                            <Link to="/profile" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors">
                                Profile
                            </Link>
                            <Link to="/change-password" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors">
                                Change Password
                            </Link>
                            <hr className="my-1 border-gray-200" />
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center space-x-2">
                        <Link to="/login" className="flex items-center space-x-1 text-gray-600 hover:text-green-600 cursor-pointer">
                            <LogIn className="h-5 w-5" />
                            <span>Login</span>
                        </Link>
                        <Link to="/register" className="flex items-center space-x-1 text-white px-4 py-2 rounded-lg cursor-pointer focus:outline-none bg-[linear-gradient(180deg,_rgb(66,230,149),_rgb(59,178,184),_rgb(66,230,149))]
                               bg-[length:100%_200%]
                               bg-top hover:bg-bottom
                               transition-all duration-500 ease-in-out
                               active:scale-90">
                            <UserPlus className="h-5 w-5" />
                            <span>Register</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
