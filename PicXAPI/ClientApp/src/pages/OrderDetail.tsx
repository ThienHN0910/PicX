import { useParams } from 'react-router-dom';
import { Package, CreditCard, Calendar, User, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Order } from '../lib/types'
import { useNavigate } from 'react-router-dom';
import type { OrderItem } from '../lib/types';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const navigate = useNavigate();

    // Helper to get auth header
    const getAuthHeader = () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/orders/${id}`, {
                    headers: getAuthHeader()
                });
                // Map lại items để đảm bảo orderDetailId luôn đúng
                const mappedItems = response.data.items.map((item: OrderItem) => {
                    const raw = item as unknown as { orderDetailId?: number; order_detail_id?: number };
                    return {
                        ...item,
                        orderDetailId: raw.orderDetailId ?? raw.order_detail_id
                    };
                });
                setOrder({ ...response.data, items: mappedItems });
            } catch (err) {
                console.error("Failed to fetch order", err);
            }
        };
        fetchOrder();
    }, [id]);

    const handleProductClick = (productId: number) => {
        navigate(`/art/${productId}`);
    };

    // Helper to extract fileId from imageUrl (assuming /api/product/image/{fileId} or Google Drive link)
    const extractFileId = (imageUrl: string) => {
    if (!imageUrl) return '';
    // Ví dụ: "/api/product/image/abc123.jpg" => lấy "abc123.jpg"
    const match = imageUrl.match(/image\/([^\/\s]+)/);
    if (match && match[1]) return match[1];

    return imageUrl;
};


    // Robust download handler for any file
    const handleDownload = async (fileId: string, fileName: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/download/file/${fileId}`);
            const contentDisposition = response.headers.get('Content-Disposition');
            const contentType = response.headers.get('Content-Type');
            if (response.ok && contentDisposition && contentType) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                let downloadName = fileName;
                const match = contentDisposition.match(/filename="?([^";]+)"?/);
                if (match && match[1]) downloadName = match[1];
                a.href = url;
                a.download = downloadName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                alert('Download failed: File not found or server error.');
            }
        } catch (err) {
            alert('Download failed.');
        }
    };

    // Thêm hàm download chứng chỉ
    const handleDownloadCert = async (orderDetailId: number, productTitle: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/certificate/download/${orderDetailId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Certificate_${productTitle.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const text = await response.text();
                console.error('Download cert error:', response.status, text);
                alert('Download certificate failed.');
            }
        } catch (e) {
            console.error('Exception:', e);
            alert('Download certificate failed.');
        }
    };

    if (!order || !Array.isArray(order.items)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md text-center border border-slate-200">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Package className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Loading order...</h3>
                    <p className="text-slate-500">Please wait a moment</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-7">
                    <div className="relative inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl mb-4 shadow-lg">
                        <Package className="h-7 w-7 text-white" />
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse opacity-75"></div>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                        Order Detail
                    </h1>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-slate-200 overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full transform translate-x-16 -translate-y-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-purple-100 rounded-full transform -translate-x-12 translate-y-12"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800">Order #{order.orderId}</h2>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center gap-2 px-6 py-3 bg-main-gradient text-white rounded-full text-lg font-semibold shadow-lg">
                                    <CreditCard className="h-5 w-5" />
                                    Paid
                                </span>
                            </div>
                        </div>

                        {/* Order Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-slate-700">Order Date</span>
                                </div>
                                <p className="text-slate-600 font-medium">
                                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                </p>
                                <p className="text-slate-500 text-sm">
                                    {new Date(order.orderDate).toLocaleTimeString('vi-VN')}
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-slate-700">Pay</span>
                                </div>
                                <p className="text-slate-600 font-medium">Credit card</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-slate-700">Items</span>
                                </div>
                                <p className="text-slate-600 font-medium">{order.items.length} item (s)</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-slate-700">Buyer</span>
                                </div>
                                <p className="text-slate-600 font-medium">{order.buyerName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items Section */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-slate-200">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">Product List</h3>
                            <p className="text-slate-600">Details of works in the order</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {order.items.map((item) => (
                            <div key={item.productId} className="group bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-6">
                                    {/* Product Image */}
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white">
                                            <img
                                                src={`${API_BASE_URL}/api/product/image/${item.image_url}`}
                                                alt={item.productTitle}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                                                onClick={() => handleProductClick(item.productId)}
                                                onError={(e) => e.currentTarget.src = '/img/placeholder-image.jpg'}
                                            />
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <div className="mb-3">
                                            <h4
                                                className="text-xl font-bold text-slate-800 mb-1 cursor-pointer"
                                                onClick={() => handleProductClick(item.productId)}
                                            >
                                                {item.productTitle}
                                            </h4>
                                            <p className="text-slate-600 flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span className="font-medium">Artist:</span>
                                                <span className="text-indigo-600 font-semibold">{item.artistName ?? 'unknow'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price & Download*/}
                                    <div className="text-right space-y-2">
                                        {/* Price Display */}
                                        <div className="px-4 py-2">
                                            <p className="text-xl font-bold text-gray-800">{item.totalPrice.toLocaleString()} VND</p>
                                        </div>

                                        {/* Download Button */}
                                        <button
                                            className="w-full bg-main-gradient hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
                                            onClick={() => handleDownload(extractFileId(item.imageUrl), item.productTitle)}
                                        >
                                            <div className="flex items-center justify-center space-x-1.5">
                                                <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm font-semibold">Download Image</span>
                                            </div>
                                        </button>
                                        <button
                                            className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
                                            onClick={() => handleDownloadCert(item.orderDetailId, item.productTitle)}
                                        >
                                            <div className="flex items-center justify-center space-x-1.5">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm font-semibold">Download Cert</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                {/* Total Summary */}
                <div className="bg-main-gradient rounded-3xl shadow-2xl p-8 text-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Total Amount</h3>
                                <p className="text-green-100">Total amount of products</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold">{order.totalAmount.toLocaleString()} VND</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;