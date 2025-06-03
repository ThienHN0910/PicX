import React from 'react';
import { useParams } from 'react-router-dom';
import { Package, Truck, CreditCard, Calendar } from 'lucide-react';
import { useStore } from '../lib/store';

const OrderDetail = () => {
  const { id } = useParams();
  const user = useStore(state => state.user);

  // Placeholder order data - replace with actual data fetching
  const order = {
    order_number: 'ORD-2025-001',
    date: new Date().toLocaleDateString(),
    status: 'shipped',
    total: 299.99,
    items: [
      {
        id: 1,
        title: 'Abstract Landscape',
        price: 199.99,
        quantity: 1,
        image_url: 'https://images.pexels.com/photos/3246665/pexels-photo-3246665.jpeg'
      },
      {
        id: 2,
        title: 'Urban Photography',
        price: 100.00,
        quantity: 1,
        image_url: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg'
      }
    ],
    shipping: {
      address: '123 Art Street',
      city: 'Creative City',
      state: 'CA',
      zip: '12345',
      country: 'USA'
    },
    payment: {
      method: 'Credit Card',
      last4: '4242',
      status: 'paid'
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">Order Date: {order.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">
                Payment: {order.payment.method} (**** {order.payment.last4})
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">Items: {order.items.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">
                Shipping to: {order.shipping.address}, {order.shipping.city}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-20 w-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-6">
          <div className="flex justify-between text-lg font-medium text-gray-900">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
        <div className="space-y-2">
          <p className="text-gray-600">
            {order.shipping.address}
          </p>
          <p className="text-gray-600">
            {order.shipping.city}, {order.shipping.state} {order.shipping.zip}
          </p>
          <p className="text-gray-600">
            {order.shipping.country}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;