import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { ProductCard } from '../components/ProductCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { useStore } from '../lib/store';
import InfiniteScroll from 'react-infinite-scroll-component';
import Masonry from 'react-masonry-css';
import { Product, Exhibition } from '../lib/types';
import axios from 'axios';
import Loading from '../components/Loading';
import { ExhibitionCard } from '../components/ExhibitionCard';

// Số lượng triển lãm ngẫu nhiên bạn muốn hiển thị
const NUMBER_OF_RANDOM_EXHIBITIONS = 3; // Ví dụ: hiển thị 3 triển lãm ngẫu nhiên

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
    const { products, categories, fetchProducts, fetchCategories, hasMore, page, user, setProducts } = useStore();

    const [randomExhibitions, setRandomExhibitions] = useState<Exhibition[]>([]);
    const [exhibitionsLoading, setExhibitionsLoading] = useState(true);
    const [exhibitionsError, setExhibitionsError] = useState<string | null>(null);

    // Helper to get auth header
    const getAuthHeader = () => {
        const token = localStorage.getItem("authToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts(true); // Initial fetch for products
    }, [fetchCategories, fetchProducts]);

    // Effect để fetch và chọn ngẫu nhiên một vài triển lãm
    useEffect(() => {
        const fetchAndSelectRandomExhibitions = async () => {
            try {
                setExhibitionsLoading(true);
                const response = await axios.get<Exhibition[]>('https://localhost:7162/api/exhibitions'); // Lấy TẤT CẢ triển lãm
                const allExhibitions = response.data;

                // Chọn ngẫu nhiên một số lượng triển lãm
                if (allExhibitions.length > 0) {
                    const shuffled = [...allExhibitions].sort(() => 0.5 - Math.random());
                    setRandomExhibitions(shuffled.slice(0, NUMBER_OF_RANDOM_EXHIBITIONS));
                } else {
                    setRandomExhibitions([]);
                }
            } catch (err: any) {
                console.error("Error fetching or selecting random exhibitions:", err);
                setExhibitionsError(err.message);
            } finally {
                setExhibitionsLoading(false);
            }
        };

        fetchAndSelectRandomExhibitions();
    }, []); // Chạy một lần khi component mount

    // Lọc sản phẩm như cũ
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // --- LOGIC MỚI: Xáo trộn sản phẩm VÀ chèn triển lãm ---
    // Xáo trộn các sản phẩm đã được lọc
    const shuffledProducts = [...filteredProducts].sort(() => 0.5 - Math.random());

    // Tạo danh sách cuối cùng để hiển thị
    const itemsToDisplay: (Product | Exhibition)[] = [...shuffledProducts];

    // Chèn các triển lãm ngẫu nhiên vào các vị trí ngẫu nhiên trong danh sách sản phẩm đã xáo trộn
    if (randomExhibitions.length > 0 && itemsToDisplay.length > 0) {
        randomExhibitions.forEach((exhibition) => {
            // Chọn một vị trí ngẫu nhiên để chèn triển lãm
            // Đảm bảo vị trí không quá cuối danh sách để Masonry có thể hiển thị tốt
            // và không chèn quá dày đặc ở một chỗ
            const insertIndex = Math.floor(Math.random() * (itemsToDisplay.length + 1));

            itemsToDisplay.splice(insertIndex, 0, exhibition);
        });
    }

    console.log('hasMore:', hasMore, 'Page:', page, 'Filtered Products:', filteredProducts);
    console.log('Random Exhibitions:', randomExhibitions);
    console.log('Items to Display:', itemsToDisplay);

    const handleAddToCart = async (product: Product) => {
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
            console.log(res.data);
        } catch (er) {
            console.log(er);
        }
    };

    const handleLike = async (product: Product) => {
        if (!user?.id) {
            console.error('User not logged in', user);
            // Optionally: Show a toast or redirect to login
            return;
        }

        const favoriteDto = {
            userId: user.id,
            productId: product.product_id
        };

        try {
            const res = await axios.post('/api/favorites', favoriteDto, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });
            console.log('Liked product:', res.data);

            setProducts(products.map(p =>
                p.product_id === product.product_id
                    ? { ...p, like_count: p.like_count + 1 }
                    : p
            ));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                {(filteredProducts.length === 0 && !hasMore && randomExhibitions.length === 0 && !exhibitionsLoading) ? (
                    <p className="text-center text-gray-500 mt-8">Not found product or any exhibition.</p>
                ) : (
                    <InfiniteScroll
                        dataLength={filteredProducts.length}
                        next={() => fetchProducts()}
                        hasMore={hasMore}
                        loader={<Loading />}
                        endMessage={<p className="text-center text-gray-500">NO More Product.</p>}
                        scrollableTarget="html"
                    >
                        <Masonry
                            breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
                            className="flex animate-fade-in"
                            columnClassName="pl-2"
                        >
                            {itemsToDisplay.map((item, index) => {
                                if ('product_id' in item) {
                                    const product = item as Product;
                                    return (
                                        <ProductCard
                                            key={`product-${product.product_id}-${index}`}
                                            product={product}
                                            onLike={() => handleLike(product)}
                                            onAddToCart={() => handleAddToCart(product)}
                                        />
                                    );
                                } else {
                                    const exhibition = item as Exhibition;
                                    return (
                                        <ExhibitionCard
                                            key={`exhibition-${exhibition.url || index}-${index}`}
                                            exhibition={exhibition}
                                        />
                                    );
                                }
                            })}
                        </Masonry>
                    </InfiniteScroll>
                )}
            </div>
        </div>
    );
}