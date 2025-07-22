import { create } from 'zustand';
import axios from 'axios';
import type { User, Product, Category, Favorite } from './types';

interface CartItem {
    product: Product;
}
interface AppState {
    user: User | null;
    products: Product[];
    categories: Category[];
    cart: { product: Product }[];
    hasMore: boolean;
    page: number;
    favorites: Favorite[];
    searchQuery: string;
    setUser: (user: User | null) => void;
    setProducts: (products: Product[]) => void;
    setCategories: (categories: Category[]) => void;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    selectedItems: CartItem[];
    setSelectedItems: (items: CartItem[]) => void;
    fetchProducts: (initial?: boolean) => Promise<void>;
    fetchCategories: () => Promise<void>;
    setFavorites: (favorites: Favorite[]) => void;
    fetchFavorites: (id: number) => Promise<void>;
    fetchAndSetUser: () => Promise<void>;
    setSearchQuery: (query: string) => void;
}

export const getAuthHeader = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useStore = create<AppState>((set, get) => ({
    user: null,
    products: [],
    categories: [],
    cart: [],
    hasMore: true,
    page: 1,
    favorites: [],
    searchQuery: '',
    setUser: (user) => set({ user }),
    setProducts: (products) => set({ products }),
    selectedItems: [],
    setSelectedItems: (items) => set({ selectedItems: items }),
    setCategories: (categories) => set({ categories }),
    addToCart: (product) =>
        set((state) => {
            const existingItem = state.cart.find((item) => item.product.product_id === product.product_id);
            if (existingItem) {
                return {
                    cart: state.cart.map((item) =>
                        item.product.product_id === product.product_id
                            ? { ...item }
                            : item
                    ),
                };
            }
            return { cart: [...state.cart, { product }] };
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
            const response = await axios.get('/api/product/all', {
                params: { page: currentPage, limit: 10 },
            });
            const data = response.data;
            if (!data || !data.products) {
                console.error('Invalid API response:', data);
                set({ hasMore: false });
                return;
            }
            const { products, hasMore = false } = data;
            const mappedProducts: Product[] = products.map((item: any) => ({
                product_id: item.productId,
                title: item.title,
                description: item.description,
                price: item.price,
                category_id: item.categoryId,
                category_name: item.categoryName,
                dimensions: item.dimensions,
                is_available: item.isAvailable,
                tags: item.tags ? (typeof item.tags === 'string' ? item.tags.split(',').map((tag: string) => tag.trim()) : item.tags) : [],
                image_file_id: item.imageFileId,
                image_url: item.imageFileId ? `/api/product/image/${item.imageFileId}` : undefined,
                artist: {
                    id: item.artist.id,
                    name: item.artist.name,
                },
                created_at: item.createdAt ? new Date(item.createdAt) : new Date(),
                like_count: item.likeCount || 0,
                is_favorited: false
            }));
            set((state) => ({
                products: initial ? mappedProducts : [...state.products, ...mappedProducts],
                hasMore,
                page: currentPage,
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            set({ hasMore: false });
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
    setFavorites: (favorites) => set({ favorites }),
    fetchFavorites: async (id) => {
        try {
            const response = await axios.get(`/api/favorites/user/${id}`, {
                headers: getAuthHeader()
            });
            const favorites = response.data;
            if (!favorites || !Array.isArray(favorites)) {
                console.error('Invalid favorites response:', favorites);
                set({ favorites: [] });
                return;
            }

            const mappedFavorites: Favorite[] = favorites.map((item: any) => ({
                favorite_id: item.favoriteId,
                product_id: item.productId,
                title: item.productName,
                description: item.description,
                price: item.price,
                dimensions: item.dimensions,
                is_available: item.isAvailable,
                tags: item.tags || [],
                image_url: item.imageUrl ? `/api/product/image/${item.imageUrl}` : undefined,
                artist: {
                    id: item.artist.id,
                    name: item.artist.name,
                },
                created_at: item.createdAt ? new Date(item.createdAt) : new Date(),
                like_count: item.likeCount || 0,
                is_favorited: true
            }));
            set({ favorites: mappedFavorites });
        } catch (error) {
            console.error('Error fetching favorites:', error);
            set({ favorites: [] });
        }
    },
    fetchAndSetUser: async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                set({ user: null });
                return;
            }
            const response = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data && response.data.user) {
                set({ user: response.data.user });
            } else {
                set({ user: null });
            }
        } catch (error) {
            set({ user: null });
        }
    },
    setSearchQuery: (query) => set({ searchQuery: query }),
}));
