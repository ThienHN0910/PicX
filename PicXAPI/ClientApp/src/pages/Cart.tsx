import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import Loading from '../components/Loading';
import { type Product } from '../lib/types';

interface CartItem {
    cartId: number;
    productId: number;
    addedAt: string;
    product: Product;
}

const Cart: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/cart', {
                headers: { 'Content-Type': 'application/json' },
            });
            setCart(response.data.cartItems);
            setError(null);
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError(err.response.data.message);
            } else {
                setError('Failed to load cart. Please try again.');
            }
            setCart([]);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId: number) => {
        try {
            await axios.delete(`/api/cart/${productId}`, {
                headers: { 'Content-Type': 'application/json' },
            });
            setCart(prevCart => prevCart.filter(item => item.productId !== productId));
        } catch (err: any) {
            alert('Failed to remove item from cart. Please try again.');
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const total = cart.reduce((sum, item) => sum + item.product.price, 0);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <Loading message="Loading your cart..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Link to="/">
                    <Button>Continue Shopping</Button>
                </Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Looks like you haven't added any artwork to your cart yet.</p>
                    <Link to="/">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                        <div key={item.cartId} className="p-6 flex items-center">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                                <img
                                    src={item.product.image_url}
                                    alt={item.product.title || 'Product image'}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = '/placeholder-image.jpg';
                                    }}
                                />
                            </div>
                            <div className="ml-6 flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {item.product.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            by {item.product.artist?.name || 'Unknown Artist'}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-900">
                                            ${item.product.price.toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-50 p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-gray-900">Total</p>
                        <p className="text-xl font-semibold text-gray-900">
                            ${total.toLocaleString()}
                        </p>
                    </div>
                    <div className="mt-6">
                        <Button className="w-full">Proceed to Checkout</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;