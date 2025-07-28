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

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth(); 
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteId, setFavoriteId] = useState<number | null>(null);

    // Function to get auth header
    const getAuthHeader = () => {
        const token = localStorage.getItem("authToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Check if the product is in user's favorites
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!isAuthenticated || !user?.id || !product) return;
            try {
                const response = await axios.get(`/api/favorites/user/${user.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader(),
                    },
                });
                const favorites = response.data;
                const favorite = favorites.find(
                    (fav: any) => fav.productId === product.product_id
                );
                setIsFavorited(!!favorite);
                setFavoriteId(favorite ? favorite.favoriteId : null);
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }
        };
        checkFavoriteStatus();
    }, [isAuthenticated, user, product]);

    const handleImageClick = () => {
        navigate(`/art/${product.product_id}`);
    };

    const handleFavoriteToggle = async (action: 'like' | 'dislike') => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!user?.id || !product) {
            toast.error('Invalid user or product data.');
            return;
        }

        try {
            if (action === 'like') {
                const favoriteDto = {
                    userId: user.id,
                    productId: product.product_id,
                };
                const response = await axios.post('/api/favorites', favoriteDto, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader(),
                    },
                });
                setIsFavorited(true);
                setFavoriteId(response.data.id); // Giả sử API trả về ID của favorite mới
                toast.success('Added to favorites');
            } else {
                if (!favoriteId) {
                    toast.error('Product is not favorited.');
                    return;
                }
                await axios.delete(`/api/favorites/${favoriteId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader(),
                    },
                });
                setIsFavorited(false);
                setFavoriteId(null);                
                toast.success('Removed from favorites');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            toast.error(`Failed to ${action} product: ${error.message}`);
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
        <div className="w-full max-w-[480px] bg-white rounded-lg shadow group transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 p-0">
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-t-lg overflow-hidden cursor-pointer">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.title || 'Product image'}
                        className="w-full h-full object-cover"
                        onClick={handleImageClick}
                        onError={(e) => {
                            e.currentTarget.src = '../resource/img/placeholder-image.png';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No image</span>
                    </div>
                )}
            </div>
            <div className="px-4 pt-3 pb-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-lg font-semibold text-gray-900">
                        {product.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleFavoriteToggle(isFavorited ? 'dislike' : 'like')}
                            className="p-1 rounded-full hover:bg-gray-100 transition"
                        >
                            <Heart
                                className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
                            />
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="p-1 rounded-full hover:bg-gray-100 transition"
                        >
                            <ShoppingCart className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>
                <div className="font-bold text-base text-gray-900 leading-tight mb-1">{product.title}</div>
                <div className="text-sm text-gray-700 mb-1">
                    {product.artist?.name}
                </div>
            </div>
        </div>
    );
};
