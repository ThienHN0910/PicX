import { create } from 'zustand';
import type { User, Product, Category } from './types';

interface AppState {
  user: User | null;
  products: Product[];
  categories: Category[];
  cart: { product: Product; quantity: number }[];
  setUser: (user: User | null) => void;
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  products: [],
  categories: [],
  cart: [],
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
}));