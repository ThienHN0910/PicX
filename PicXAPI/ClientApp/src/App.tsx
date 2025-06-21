import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useStore } from './lib/store';
import Navbar from './components/Navbar';
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
import AdminOrders from './pages/AdminOrders';
import ArtistOrders from './pages/ArtistOrders';
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

// Component để redirect nếu đã đăng nhập
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
// Protected route wrapper
// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const user = useStore(state => state.user);

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (!allowedRoles.includes(user.role)) {
//     return <Navigate to="/\" replace />;
//   }

//   return children;
// };

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
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
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/art/:id" element={<ArtDetail />} />
            <Route path="/artist/:id" element={<ArtistProfile />} />

                            {/* Protected routes - Buyer & Artist */}
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/dashboard" element={
                                // <ProtectedRoute allowedRoles={['buyer', 'artist', 'admin']}>
                                <Dashboard />
                                // </ProtectedRoute>
                            } />
                            <Route path="/cart" element={
                                // <ProtectedRoute allowedRoles={['buyer', 'artist']}>
                                <Cart />
                                // </ProtectedRoute>
                            } />
                            <Route path="/payments" element={
                                // <ProtectedRoute allowedRoles={['buyer', 'artist']}>
                                <Payments />
                                // </ProtectedRoute>
                            } />
                            <Route path="/orders" element={
                                // <ProtectedRoute allowedRoles={['buyer', 'artist']}>
                                <OrderHistory />
                                // </ProtectedRoute>
                            } />
                            <Route path="/orders/:id" element={
                                // <ProtectedRoute allowedRoles={['buyer', 'artist']}>
                                <OrderDetail />
                                // </ProtectedRoute>
                            } />
                            <Route path="/chat" element={
                                // <ProtectedRoute allowedRoles={['buyer', 'artist']}>
                                <Chat />
                                // </ProtectedRoute>
                            } />

                            {/* Artist & Admin routes */}
                            <Route path="/products" element={
                                // <ProtectedRoute allowedRoles={['artist', 'admin']}>
                                <ProductManagement />
                                // {/* </ProtectedRoute> */}
                            } />
                            <Route path="/products/add" element={
                                // <ProtectedRoute allowedRoles={['artist', 'admin']}>
                                <AddProduct />
                                /* </ProtectedRoute> */
                            } />
                            <Route path="/products/edit/:id" element={
                                // <ProtectedRoute allowedRoles={['artist', 'admin']}>
                                <EditProduct />
                                /* </ProtectedRoute> */
                            } />
                            <Route path="/ArtistFinanceReport" element={
                                // <ProtectedRoute allowedRoles={['artist', 'admin']}>
                                <ArtistFinanceReport />
                                /* </ProtectedRoute> */
                            } />

                            <Route path="/artist/orders" element={<ArtistOrders />} />
                            <Route path="/artist/order/:id" element={<OrderDetail />} />

            /* Admin only routes */
                            <Route path="/users" element={
                                // <ProtectedRoute allowedRoles={['admin']}>
                                <UserList />
                                /* </ProtectedRoute> */
                            } />
                            <Route path="/finance" element={
                                // <ProtectedRoute allowedRoles={['admin']}>
                                <Finance />
                                /* </ProtectedRoute> */
                            } />
                            <Route path="/admin/orders" element={<AdminOrders />} />
                            <Route path="/admin/order/:id" element={<OrderDetail />} />
                        </Routes>
                    </main>
                    <ToastContainer position="top-right" autoClose={3000} />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;