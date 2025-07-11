import { Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider'; // 👈 import auth context
import { Product } from '../lib/types';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ProductCardProps {
    product: Product;
    onLike?: () => void;
    onAddToCart?: () => void;
}

export const ProductCard = ({ product, onLike, onAddToCart }: ProductCardProps) => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth(); // 👈 check login
    const [isFavorited, setIsFavorited] = useState(false);

    // Function to get auth header
    const getAuthHeader = () => {
        const token = localStorage.getItem("authToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Check if the product is in user's favorites
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!isAuthenticated) return;
            try {
                const response = await axios.get(`/api/favorites/user/${user?.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader(),
                    },
                });
                const favorites = response.data; // Assuming this returns an array of favorite product IDs
                const isProductFavorited = favorites.some(
                    (fav: any) => fav.productId === product.product_id
                );
                setIsFavorited(isProductFavorited);
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }
        };

        checkFavoriteStatus();
    }, [isAuthenticated, product.product_id]);

    const handleImageClick = () => {
        navigate(`/art/${product.product_id}`);
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            await onLike?.();
            setIsFavorited(true); // Update heart color immediately
            toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
        } catch (error) {
            console.error('Error liking product:', error);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            await onAddToCart?.();
            toast.success(`Added to cart successfully`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart.');
        }
    };

    return (
        <div className="w-full mb-4 relative group">
            {product.image_url ? (
                <img
                    src={product.image_url}
                    alt={product.title || 'Product image'}
                    className="w-full h-auto object-cover rounded-lg shadow-md transition-opacity duration-300 group-hover:opacity-80"
                    onClick={handleImageClick}
                    onError={(e) => {
                        e.currentTarget.src = '../resource/img/placeholder-image.png';
                    }}
                />
            ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg shadow-md">
                    <span className="text-gray-400">No image</span>
                </div>
            )}
            <button
                onClick={handleLike}
                className="absolute top-2 right-2 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
                <Heart
                    className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
                />
            </button>
            <button
                onClick={handleAddToCart}
                className="absolute bottom-2 right-2 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
                <ShoppingCart className="h-5 w-5 text-gray-600" />
            </button>
        </div>
    );
};
