import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  pricePerKg: number;
  quantityKg: number;
  photo: string;
  farmerName: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const exists = state.items.find(
            (i) => i.productId === item.productId
          );
          if (exists) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantityKg: i.quantityKg + item.quantityKg }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantityKg: quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce(
          (sum, item) => sum + item.pricePerKg * item.quantityKg,
          0
        ),
    }),
    { name: 'farmflow-cart' }
  )
);
