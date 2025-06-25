import { Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider'; // 👈 import auth context
import { Product } from '../lib/types';

interface ProductCardProps {
    product: Product;
    onLike?: () => void;
    onAddToCart?: () => void;
}

export const ProductCard = ({ product, onLike, onAddToCart }: ProductCardProps) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); // 👈 check login

    const handleImageClick = () => {
        navigate(`/art/${product.product_id}`);
    };

    const handleLike = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        onLike?.();
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        onAddToCart?.();
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
                <Heart className="h-5 w-5 text-gray-600" />
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
