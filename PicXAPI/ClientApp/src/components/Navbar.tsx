﻿import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, Bell, MessageCircle, Settings, ShoppingCart, Star, ClipboardList, Users, BarChart2, Grid, Plus,
    List, Wallet, Inbox
} from 'lucide-react';
import { useStore } from '../lib/store';
import { CategoryFilter } from './CategoryFilter';
import Chat from '../pages/Chat'; // Import component Chat

export default function Navbar() {
    const location = useLocation();
    const { user, categories } = useStore();
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
    const [showCategory, setShowCategory] = useState(false);
    const [showChatPopup, setShowChatPopup] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);
    const chatPopupRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setShowCategory(false);
            }
            if (chatPopupRef.current && !chatPopupRef.current.contains(event.target as Node)) {
                setShowChatPopup(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCategorySelect = (categoryId?: number) => {
        setSelectedCategory(categoryId);
        window.dispatchEvent(new CustomEvent('select-category', { detail: categoryId }));
        setShowCategory(false);
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setShowCategory(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowCategory(false);
        }, 100);
    };

    const toggleChatPopup = () => {
        setShowChatPopup((prev) => !prev);
    };

    return (
        <nav className="w-20 bg-white border-r flex flex-col items-center space-y-4 fixed top-0 left-0 h-full z-20">
            <Link to="/" title="Home" className="flex items-center justify-center w-10 mt-3 mb-6">
                <img src="./src/resource/img/logo.png" alt="PicX" className="w-24" />
            </Link>

            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col items-center gap-y-2">
                <Link
                    to="/"
                    title="Home"
                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/' ? 'bg-gray-200' : ''}`}
                >
                    <Home className="w-6 h-6" />
                </Link>
                <Link
                    to="/cart"
                    title="Cart"
                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/cart' ? 'bg-gray-200' : ''}`}
                >
                    <ShoppingCart className="w-6 h-6" />
                </Link>
                <Link
                    to="/notifications"
                    title="Notifications"
                    className="p-3 rounded-lg hover:bg-gray-100 relative"
                >
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-2 right-2 bg-red-500 text-xs text-white rounded-full px-1.5">99+</span>
                </Link>
                <div
                    className="relative"
                    ref={categoryRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <button
                        title="Categories"
                        className="p-3 rounded-lg hover:bg-gray-100 focus:outline-none"
                    >
                        <Grid className="w-6 h-6" />
                    </button>
                    {showCategory && (
                        <div
                            className="fixed left-20 top-1/2 -translate-y-1/2 z-50 bg-white shadow-lg rounded-lg py-2 w-44 border max-h-[80vh] overflow-y-auto"
                            style={{ minWidth: 180 }}
                        >
                            <CategoryFilter
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onSelect={handleCategorySelect}
                                showAll
                            />
                        </div>
                    )}
                </div>
                <button
                    title="Chat"
                    className="p-3 rounded-lg hover:bg-gray-100"
                    onClick={toggleChatPopup}
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
                {user && user.role !== 'guest' && (
                    <>
                        <div className="w-full border-t my-2" />
                        <Link
                            to="/favorite"
                            title="Favorite Pictures"
                            className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/favorite' ? 'bg-gray-200' : ''}`}
                        >
                            <Star className="w-6 h-6" />
                        </Link>
                        {user.role === 'buyer' && (
                            <>
                                <Link
                                    to="/orders"
                                    title="Your Orders"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/orders' ? 'bg-gray-200' : ''}`}
                                >
                                    <ClipboardList className="w-6 h-6" />
                                </Link>
                                <Link
                                    to="/wallet"
                                    title="Wallet"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/wallet' ? 'bg-gray-200' : ''}`}
                                >
                                    <Wallet className="w-6 h-6" />
                                </Link>
                            </>
                        )}
                        {user.role === 'artist' && (
                            <>
                                <Link
                                    to="/products"
                                    title="Manage Products"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/products' ? 'bg-gray-200' : ''}`}
                                >
                                    <Plus className="w-6 h-6" />
                                </Link>
                                <Link
                                    to="/dashboard"
                                    title="Finance Reports"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/dashboard' ? 'bg-gray-200' : ''}`}
                                >
                                    <BarChart2 className="w-6 h-6" />
                                </Link>
                                <Link
                                    to="/artist/orders"
                                    title="Order List"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/artist/orders' ? 'bg-gray-200' : ''}`}
                                >
                                    <List className="w-6 h-6" />
                                </Link>
                                <Link
                                    to="/wallet"
                                    title="Wallet"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/wallet' ? 'bg-gray-200' : ''}`}
                                >
                                    <Wallet className="w-6 h-6" />
                                </Link>
                            </>
                        )}
                        {user.role === 'admin' && (
                            <>
                                <Link
                                    to="/dashboard"
                                    title="Finance Reports"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/dashboard' ? 'bg-gray-200' : ''}`}
                                >
                                    <BarChart2 className="w-6 h-6" />
                                </Link>
                                <Link
                                    to="/users"
                                    title="User List"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/users' ? 'bg-gray-200' : ''}`}
                                >
                                    <Users className="w-6 h-6" />
                                </Link>
                                <Link
                                    to="/products"
                                    title="Manage Products"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/products' ? 'bg-gray-200' : ''}`}
                                >
                                    <Plus className="w-6 h-6" />
                                </Link>
                                <Link
                                    to="/admin/orders"
                                    title="Order List"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/admin/orders' ? 'bg-gray-200' : ''}`}
                                >
                                    <List className="w-6 h-6" />
                                </Link>
                                <Link
                                    to="/admin/reports"
                                    title="Manage Reports"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/admin/reports' ? 'bg-gray-200' : ''}`}
                                >
                                    <ClipboardList className="w-6 h-6" />
                                </Link>
                                <Link
                                    to="/admin/withdrawals"
                                    title="Manage withdrawal Request"
                                    className={`p-3 rounded-lg hover:bg-gray-100 ${location.pathname === '/admin/withdrawals' ? 'bg-gray-200' : ''}`}
                                >
                                    <Inbox className="w-6 h-6" />
                                </Link>
                            </>
                        )}
                    </>
                )}
                <div className="flex-1" />
                <Link
                    to="/settings"
                    title="Settings"
                    className="p-3 rounded-lg hover:bg-gray-100 mb-2"
                >
                    <Settings className="w-6 h-6" />
                </Link>
            </div>

            {/* Popup Chat */}
            {showChatPopup && (
                <div ref={chatPopupRef}>
                    <Chat onClose={() => setShowChatPopup(false)} />
                </div>
            )}
        </nav>
    );
}