import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { ProductCard } from '../components/ProductCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { useStore } from '../lib/store';
import InfiniteScroll from 'react-infinite-scroll-component';
import Masonry from 'react-masonry-css';
import { Product } from '../lib/types';
import axios from 'axios';
import Loading from '../components/Loading';

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
    const { products, categories, fetchProducts, fetchCategories, hasMore, page } = useStore();

    useEffect(() => {
        fetchCategories();
        fetchProducts(true); // Initial fetch
    }, [fetchCategories, fetchProducts]);

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    console.log('hasMore:', hasMore, 'Page:', page, 'Filtered Products:', filteredProducts.length);

    const handleAddToCart = async (product: Product) => {
        const cartDto = {
            ProductId: product.product_id
        }
        try {
            const res = await axios.post('/api/cart/add', cartDto, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
            })
            console.log(res.data)
        } catch(er) {
            console.log(er)
        }
        

    };

    const handleLike = (product: Product) => {
        // Implement like logic here if needed
        console.log('Liked product:', product.product_id);
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

                <InfiniteScroll
                    dataLength={filteredProducts.length}
                    next={() => fetchProducts()}
                    hasMore={hasMore}
                    loader={<Loading />}
                    endMessage={<p className="text-center text-gray-500">No more products</p>}
                    scrollableTarget="html" // Use browser scrollbar
                >
                    <Masonry
                        breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
                        className="flex animate-fade-in"
                        columnClassName="pl-2"
                    >
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.product_id}
                                product={product}
                                onLike={() => handleLike(product)}
                                onAddToCart={() => handleAddToCart(product)}
                            />
                        ))}
                    </Masonry>
                </InfiniteScroll>
            </div>
        </div>
    );
}