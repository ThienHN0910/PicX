import { create } from 'zustand';
import axios from 'axios';
import type { User, Product, Category } from './types';

interface AppState {
    user: User | null;
    products: Product[];
    categories: Category[];
    cart: { product: Product; quantity: number }[];
    hasMore: boolean;
    page: number;
    setUser: (user: User | null) => void;
    setProducts: (products: Product[]) => void;
    setCategories: (categories: Category[]) => void;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    fetchProducts: (initial?: boolean) => Promise<void>;
    fetchCategories: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
    user: null,
    products: [],
    categories: [],
    cart: [],
    hasMore: true,
    page: 1,
    setUser: (user) => set({ user }),
    setProducts: (products) => set({ products }),
    setCategories: (categories) => set({ categories }),
    addToCart: (product, quantity = 1) =>
        set((state) => {
            const existingItem = state.cart.find((item) => item.product.product_id === product.product_id);
            if (existingItem) {
                return {
                    cart: state.cart.map((item) =>
                        item.product.product_id === product.product_id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    ),
                };
            }
            return { cart: [...state.cart, { product, quantity }] };
        }),
    removeFromCart: (productId) =>
        set((state) => ({
            cart: state.cart.filter((item) => item.product.product_id !== productId),
        })),
    clearCart: () => set({ cart: [] }),
    fetchProducts: async (initial = false) => {
        if (!initial && !get().hasMore) return;
        try {
            const currentPage = initial ? 1 : get().page + 1;
            console.log('Fetching products, page:', currentPage); // Debug log
            const response = await axios.get('/api/product/all', {
                params: { page: currentPage, limit: 10 },
            });
            const data = response.data;
            if (!data || !data.products) {
                console.error('Invalid API response:', data);
                set({ hasMore: false });
                return;
            }
            const { products, hasMore = false } = data; // Default hasMore to false if undefined
            const mappedProducts: Product[] = products.map((item: any) => ({
                product_id: item.productId,
                title: item.title,
                description: item.description,
                price: item.price,
                category_id: item.categoryId,
                category_name: item.categoryName,
                medium: item.medium,
                dimensions: item.dimensions,
                is_available: item.isAvailable,
                tags: item.tags ? (typeof item.tags === 'string' ? item.tags.split(',').map((tag: string) => tag.trim()) : item.tags) : [],
                image_file_id: item.imageFileId,
                image_url: item.imageFileId ? `/api/product/image/${item.imageFileId}` : undefined,
                additional_images: item.additionalImages ? JSON.parse(item.additionalImages) : [],
                artist: {
                    id: item.artist.id,
                    name: item.artist.name,
                },
                created_at: item.createdAt ? new Date(item.createdAt) : new Date(),
                like_count: item.likeCount || 0,
            }));
            set((state) => ({
                products: initial ? mappedProducts : [...state.products, ...mappedProducts],
                hasMore,
                page: currentPage,
            }));
            console.log('Fetched products, hasMore:', hasMore); // Debug log
        } catch (error) {
            console.error('Error fetching products:', error);
            set({ hasMore: false }); // Stop further fetches on error
        }
    },
    fetchCategories: async () => {
        try {
            const response = await axios.get('/api/product/categories');
            const categories: Category[] = response.data.map((item: any) => ({
                category_id: item.categoryId,
                name: item.name,
            }));
            set({ categories });
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    },
}));

// Helper to get current state
const get = useStore.getState;