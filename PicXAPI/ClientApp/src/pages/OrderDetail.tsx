import { useParams } from 'react-router-dom';
import { Package, Truck, CreditCard, Calendar } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';


const OrderDetail = () => {
    const { id } = useParams();
    
    interface OrderItem {
        productId: number;
        title: string;
        totalPrice: number;
        imageUrl: string;
        artistName: string;
    }

    interface Order {
        orderId: string;
        orderDate: string; 
        totalAmount: number;
        items: OrderItem[];
    }

    const [order, setOrder] = useState<Order | null>(null);



    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${id}`, {
                    withCredentials: true
                });
                setOrder(response.data);
            } catch (err) {
                console.error("Failed to fetch order", err);
            }
        };
        fetchOrder();
    }, [id]);

    //Debug
    console.log("productIds:", order?.items.map(item => item.productId));
    //

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'delivered':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!order || !Array.isArray(order.items)) {
        return <div className="text-center text-gray-500">Loading order...</div>;
    }


    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderId}</h1>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Paid
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-600">Order Date: {new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-600">Payment: Credit Card</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-600">Items: {order.items.length}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Truck className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-600">Shipping not implemented</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.productId} className="flex items-center space-x-4">
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="h-20 w-20 object-cover rounded-lg"
                                    onError={(e) => e.currentTarget.src = '/placeholder-image.jpg'}
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                                    <p className="text-gray-600">Artist: {item.artistName ?? 'Unknown'}</p>
                                </div>
                                <p className="text-lg font-medium text-gray-900">${item.totalPrice.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                    <div className="flex justify-between text-lg font-medium text-gray-900">
                        <span>Total</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;