import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useStore } from './lib/store';
import Navbar from './components/Navbar';
import Topbar from './components/Topbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ArtDetail from './pages/ArtDetail';
import Cart from './pages/Cart';
import Payments from './pages/Payments';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import Chat from './pages/Chat';
import UserList from './pages/UserList';
import Finance from './pages/Finance';
import { AuthProvider, useAuth } from './components/AuthProvider';
import ArtistProfile from './pages/ArtistProfile';
import ArtistFinanceReport from './pages/ArtistFinanceReport';
import Favorites from './pages/Favorites';
import AdminOrders from './pages/AdminOrders';
import ArtistOrders from './pages/ArtistOrders';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import { ResetPassword } from './pages/ResetPassword';
import Deposit from './pages/Deposit';
import ChangePassword from './pages/ChangePassword';
import AdminReportList from './pages/AdminReportList';
import Wallet from './pages/Wallet';
import AdminWithdrawals from './pages/AdminWithdrawals'; 
import VerifyEmail from './pages/VerifyEmail';
import { createNotificationConnection } from './lib/notification.tsx';
import { toast } from 'react-toastify';
import NotificationPage from './pages/NotificationPage';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
    const fetchAndSetUser = useStore(state => state.fetchAndSetUser);

    useEffect(() => {
        fetchAndSetUser();
    }, [fetchAndSetUser]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const connection = createNotificationConnection(token);
        connection.on('ReceiveNotification', (notification) => {
            toast.info(notification.Message || notification.message || 'Bạn có thông báo mới!');
        });
        connection.start().catch(() => {});
        return () => {
            connection.stop();
        };
    }, []);

    return (
        <AuthProvider>
            <Router>
                <div className="flex min-h-screen bg-gray-50">
                    {/* Sidebar trái */}
                    <Navbar />
                    {/* Nội dung chính */}
                    <div className="flex-1 flex flex-col pl-20">
                        {/* Topbar */}
                        <Topbar />
                        <main className="flex-1 p-6">
                            <Routes>
                                {/* Public routes */}
                                <Route path="/" element={<Home />} />
                                <Route
                                    path="/login"
                                    element={
                                        <PublicRoute>
                                            <Login />
                                        </PublicRoute>
                                    }
                                />
                                <Route
                                    path="/register"
                                    element={
                                        <PublicRoute>
                                            <Register />
                                        </PublicRoute>
                                    }
                                />
                                <Route
                                    path="/verify-email"
                                    element={
                                        <PublicRoute>
                                            <VerifyEmail />
                                        </PublicRoute>
                                    }
                                />
                                <Route 
                                path="/notifications"
                                element={<ProtectedRoute>
                                    <NotificationPage />
                                </ProtectedRoute>} />
                                <Route
                                    path="/change-password"
                                    element={<ChangePassword />}
                                />
                                <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/art/:id" element={<ArtDetail />} />
                                <Route path="/artist/:id" element={<ArtistProfile />} />
                                <Route path="/reset-pass" element={<ResetPassword />} />
                                {/* Protected routes - Buyer & Artist */}
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <Profile />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/artist-profile"
                                    element={
                                        <PublicRoute>
                                            <ArtistProfile />
                                        </PublicRoute>
                                    }
                                />
                                <Route path="/profile/artist/:id" element={<ArtistProfile />} />
                                <Route
                                    path="/favorite"
                                    element={
                                        <ProtectedRoute>
                                            <Favorites />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/payment/:orderId" element={<Payments />} />
                                <Route path="/orders" element={<OrderHistory />} />
                                <Route path="/orders/:id" element={<OrderDetail />} />
                                <Route path="/chat" element={<Chat />} />
                                {/* Thêm route nạp tiền cho buyer */}
                                <Route
                                    path="/deposit"
                                    element={
                                        <ProtectedRoute>
                                            <Deposit />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/wallet"
                                    element={
                                        <ProtectedRoute>
                                            <Wallet />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Artist & Admin routes */}
                                <Route path="/products" element={<ProductManagement />} />
                                <Route path="/products/add" element={<AddProduct />} />
                                <Route path="/products/edit/:id" element={<EditProduct />} />
                                <Route path="/ArtistFinanceReport" element={<ArtistFinanceReport />} />
                                <Route path="/artist/orders" element={<ArtistOrders />} />
                                <Route path="/artist/order/:id" element={<OrderDetail />} />
                                {/* Admin only routes */}
                                <Route path="/users" element={<UserList />} />
                                <Route path="/finance" element={<Finance />} />
                                <Route path="/admin/orders" element={<AdminOrders />} />
                                <Route path="/admin/order/:id" element={<OrderDetail />} />
                                <Route path="/admin/reports" element={<AdminReportList />} />
                                <Route
                                    path="/admin/withdrawals"
                                    element={
                                        <ProtectedRoute>
                                            <AdminWithdrawals />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </main>
                        <ToastContainer position="top-right" autoClose={3000} />
                    </div>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;