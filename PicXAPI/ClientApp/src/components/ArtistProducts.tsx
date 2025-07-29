import { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductCard } from './ProductCard';
import { Product } from '../lib/types';
import Loading from './Loading';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
interface ArtistProductsProps {
    artistId: number;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const ArtistProducts: React.FC<ArtistProductsProps> = ({ artistId }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchArtistProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/product/artist/${artistId}`);
                const allProducts = response.data.products.map((p: any) => ({
                    ...p,
                    image_url: p.imageFileId ? `${API_BASE_URL}/api/product/image/${p.imageFileId}` : undefined
                }));

                const shuffled = allProducts.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 4);

                setProducts(selected);
            } catch (err: any) {
                console.error("Error fetching artist's products:", err);
                setError('Failed to load products.');
            } finally {
                setLoading(false);
            }
        };

        if (artistId) {
            fetchArtistProducts();
        }
    }, [artistId]);

    if (loading) return <Loading />;
    if (error) return <p className="text-red-500 text-sm">{error}</p>;
    if (products.length === 0) return <p className="text-gray-500 text-sm">No More products from this artist.</p>;

    const handleProductClick = (productId: number) => {
        navigate(`/art/${productId}`);
    };

    return (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-50 z-10">
                    <Loading />
                </div>
            )}

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {products.map((product) => (
                    <div
                        key={product.productId}
                        className="cursor-pointer group"
                        onClick={() => handleProductClick(product.productId)}
                    >
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.title || 'Product image'}
                                className="w-full h-auto object-cover rounded-lg shadow-md transition-opacity duration-300 group-hover:opacity-80"
                                onError={(e) => {
                                    e.currentTarget.src = '/img/placeholder-image.png';
                                }}
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg shadow-md">
                                <span className="text-gray-400">No image</span>
                            </div>
                        )}
                    </div>
                ))}
                    </div>
        </div>
            );
};
            export default ArtistProducts;