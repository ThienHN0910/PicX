import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { ProductCard } from '../components/ProductCard';
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
    const { searchQuery, setSearchQuery, products, categories, fetchProducts, fetchCategories, hasMore, page, user, setProducts } = useStore();
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();

    // Lắng nghe sự kiện chọn category từ sidebar
    useEffect(() => {
        const handler = (e: any) => setSelectedCategory(e.detail);
        window.addEventListener('select-category', handler);
        return () => window.removeEventListener('select-category', handler);
    }, []);

    const [randomExhibitions, setRandomExhibitions] = useState<Exhibition[]>([]);
    const [exhibitionsLoading, setExhibitionsLoading] = useState(true);
    const [exhibitionsError, setExhibitionsError] = useState<string | null>(null);
    const [shuffledItems, setShuffledItems] = useState<(Product | Exhibition)[]>([]);
    const [randomSeed, setRandomSeed] = useState<number>(Date.now());
    const prevProductsLength = useRef(0);

    // Helper random với seed (Fisher-Yates)
    function shuffleWithSeed<T>(array: T[], seed: number): T[] {
        const result = [...array];
        let m = result.length, t, i;
        let s = seed;
        while (m) {
            s = (s * 9301 + 49297) % 233280;
            i = Math.floor((s / 233280) * m--);
            t = result[m];
            result[m] = result[i];
            result[i] = t;
        }
        return result;
    }

    const getAuthHeader = () => {
        const token = localStorage.getItem("authToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Khi refresh hoặc fetchProducts initial, đổi seed để random lại
    useEffect(() => {
        setRandomSeed(Date.now());
    }, []); // chỉ chạy khi mount (refresh)

    useEffect(() => {
        fetchCategories();
        fetchProducts(true); // initial fetch
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

    // Xử lý random khi products thay đổi
    useEffect(() => {
        // Lọc sản phẩm như cũ
        const filteredProducts = products.filter((product) => {
            const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        // Nếu là lần đầu (refresh hoặc initial), random toàn bộ
        if (prevProductsLength.current === 0 || filteredProducts.length < prevProductsLength.current) {
            // Xáo trộn với seed
            const shuffledProducts = shuffleWithSeed(filteredProducts, randomSeed);

            // Chèn exhibition vào vị trí random (dùng seed)
            let items: (Product | Exhibition)[] = [...shuffledProducts];
            if (randomExhibitions.length > 0 && items.length > 0) {
                let s = randomSeed;
                randomExhibitions.forEach((exhibition, idx) => {
                    s = (s * 9301 + 49297 + idx) % 233280;
                    const insertIndex = Math.floor((s / 233280) * (items.length + 1));
                    items.splice(insertIndex, 0, exhibition);
                });
            }
            setShuffledItems(items);
        }
        // Nếu fetch thêm (infinity scroll), random phần mới rồi nối vào cuối
        else if (filteredProducts.length > prevProductsLength.current) {
            const newProducts = filteredProducts.slice(prevProductsLength.current);
            const newSeed = Date.now();
            const shuffledNewProducts = shuffleWithSeed(newProducts, newSeed);
            setShuffledItems((prev) => [...prev, ...shuffledNewProducts]);
        }
        prevProductsLength.current = filteredProducts.length;
    }, [products, randomExhibitions, searchQuery, selectedCategory, randomSeed]);

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
        <div className="min-h-screen bg-gray">
            <div >
                {/* ĐÃ XÓA CategoryFilter */}
                {(shuffledItems.length === 0 && !hasMore && randomExhibitions.length === 0 && !exhibitionsLoading) ? (
                    <p className="text-center text-gray-500 mt-8">Not found product or any exhibition.</p>
                ) : (
                    <InfiniteScroll
                        dataLength={shuffledItems.length}
                        next={() => fetchProducts()}
                        hasMore={hasMore}
                        loader={<Loading />}
                        endMessage={<p className="text-center text-gray-500">NO More Product.</p>}
                        scrollableTarget="html"
                    >
                        <Masonry
                            breakpointCols={{ default: 5, 1400: 4, 1100: 3, 700: 2, 500: 1 }}
                            className="flex animate-fade-in"
                            columnClassName="pl-2"
                        >
                            {shuffledItems.map((item, index) => {
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