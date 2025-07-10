import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../lib/store';
import Masonry from 'react-masonry-css';
import { Product, Favorite } from '../lib/types';
import axios from 'axios';
import Loading from '../components/Loading';

export default function Favorites() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const { favorites, categories, fetchCategories, fetchFavorites, user, setFavorites } = useStore();

    // Lắng nghe sự kiện chọn category từ sidebar
    useEffect(() => {
        const handler = (e: any) => setSelectedCategory(e.detail);
        window.addEventListener('select-category', handler);
        return () => window.removeEventListener('select-category', handler);
    }, []);

    // Helper to get auth header
    const getAuthHeader = () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        if (user?.id) {
            setIsLoading(true);
            fetchCategories();
            fetchFavorites(user.id).finally(() => setIsLoading(false));
        }
    }, [fetchCategories, fetchFavorites, user]);

    // Filter favorites theo search và category (nếu có category_id)
    const filteredFavorites = favorites.filter((product) => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            !selectedCategory ||
            product.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddToCart = async (product: Product) => {
        if (!user?.id) {
            console.error('User not logged in');
            return;
        }
        const cartDto = {
            ProductId: product.product_id
        };
        try {
            const res = await axios.post('/api/cart/add', cartDto, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });
            console.log('Added to cart:', res.data);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const handledisLike = async (favorite: Favorite) => {
        if (!user?.id) {
            console.error('User not logged in');
            return;
        }

        try {
            await axios.delete(`/api/favorites/${favorite.favorite_id}`, {
                data: { userId: user.id, favoriteId: favorite.product_id },
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });
            console.log('Unliked favorite:', favorite.product_id);
            await fetchFavorites(user.id);

        } catch (error: any) {
            if (error.response?.status === 409) {
                console.error('Product already favorited');
            } else if (error.response?.status === 404) {
                console.error('User or product not found');
            } else {
                console.error('Error toggling like:', error);
            }
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 text-center">
                <p className="text-gray-500">Please log in to view your favorite products.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 ml-20">
            <div>
                <h1 className="text-2xl font-bold mb-6 ml-2">Your Favorite Products</h1>

                {/* Đã xóa CategoryFilter */}

                {isLoading ? (
                    <Loading />
                ) : filteredFavorites.length === 0 ? (
                    <p className="text-center text-gray-500">No favorite products found.</p>
                ) : (
                    <Masonry
                        breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
                        className="flex animate-fade-in"
                        columnClassName="pl-2"
                    >
                        {filteredFavorites.map((product) => (
                            <ProductCard
                                key={product.product_id}
                                product={product}
                                onLike={() => handledisLike(product)}
                                onAddToCart={() => handleAddToCart(product)}
                            />
                        ))}
                    </Masonry>
                )}
            </div>
        </div>
    );
}