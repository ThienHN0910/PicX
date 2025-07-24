import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import Loading from '../components/Loading';
import { useStore } from '../lib/store';
import { type Product } from '../lib/types';

interface CartItem {
    cartId: number;
    productId: number;
    addedAt: string;
    product: Product;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Cart: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();
    const setSelectedItems = useStore(state => state.setSelectedItems);

    const toggleProduct = (productId: number) => {
        setSelectedProductIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCart(response.data.cartItems);
            setError(null);
        } catch (err: any) {
            setError('Error loading cart.');
            setCart([]);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (cartId: number) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/cart/${cartId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
        } catch (err) {
            alert('Failed to remove product.');
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const total = cart
        .filter(item => selectedProductIds.includes(item.productId))
        .reduce((sum, item) => sum + item.product.price, 0);

    const handleCheckout = async () => {
        const selectedItems = cart.filter(item =>
            selectedProductIds.includes(item.productId)
        );

        if (selectedItems.length === 0) {
            alert("Please select at least one product to proceed to payment.");
            return;
        }

        const orderDto = {
            items: selectedItems.map(item => ({
                productId: item.productId,
                totalPrice: item.product.price
            }))
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/api/orders`, orderDto, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Lưu selectedItems vào Zustand store
            setSelectedItems(selectedItems);
            

            // Điều hướng sang trang thanh toán
            const orderId = res.data.orderId;
            navigate(`/payment/${orderId}`);
        } catch (err) {
            console.error(err);
            alert("Payment failed.");
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <Loading message="Loading cart..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <p className="text-red-500">{error}</p>
                <Link to="/">
                    <Button>Back to Home</Button>
                </Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <ShoppingCart className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold">Your cart is empty</h2>
                <Link to="/">
                    <Button className="mt-4">Shop now</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
            <div className="bg-white shadow rounded-lg">
                <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                        <div key={item.cartId} className="p-6 flex items-center">
                            <input
                                type="checkbox"
                                className="mr-4"
                                checked={selectedProductIds.includes(item.productId)}
                                onChange={() => toggleProduct(item.productId)}
                            />
                            <img
                                src={item.product.image_url}
                                alt={item.product.title}
                                className="h-24 w-24 rounded object-cover"
                            />
                            <div className="ml-6 flex-1">
                                <h3 className="text-lg font-medium">{item.product.title}</h3>
                                <p className="text-sm text-gray-500">by {item.product.artist?.name || 'Unknown'}</p>
                                <p className="text-sm font-semibold mt-1">{item.product.price.toLocaleString()} VND</p>
                            </div>
                            <button
                                onClick={() => removeFromCart(item.cartId)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <p className="text-lg font-medium">Total</p>
                        <p className="text-xl font-bold">{total.toLocaleString()} VND</p>
                    </div>
                    <Button className="mt-4 w-full" onClick={handleCheckout}>
                        Proceed to Payment
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
