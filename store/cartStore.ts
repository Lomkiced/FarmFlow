import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  pricePerKg: number;
  quantityKg: number;
  stockKg: number;
  photo: string;
  farmerName: string;
  farmId?: string;
}

interface CartStore {
  items: CartItem[];
  selectedIds: string[];

  // Item mutations
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Selection
  toggleSelect: (productId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isSelected: (productId: string) => boolean;
  areAllSelected: () => boolean;

  // Computed
  total: () => number;
  selectedTotal: () => number;
  selectedItems: () => CartItem[];
  selectedCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedIds: [],

      addItem: (item) =>
        set((state) => {
          const exists = state.items.find(
            (i) => i.productId === item.productId
          );
          if (exists) {
            const newQty = Math.min(
              exists.quantityKg + item.quantityKg,
              item.stockKg > 0 ? item.stockKg : 9999
            );
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantityKg: newQty, stockKg: item.stockKg }
                  : i
              ),
              // Auto-select newly added item
              selectedIds: state.selectedIds.includes(item.productId)
                ? state.selectedIds
                : [...state.selectedIds, item.productId],
            };
          }
          return {
            items: [...state.items, item],
            selectedIds: [...state.selectedIds, item.productId],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
          selectedIds: state.selectedIds.filter((id) => id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const item = state.items.find((i) => i.productId === productId);
          if (!item) return state;
          const maxQty = item.stockKg > 0 ? item.stockKg : 9999;
          const clampedQty = Math.max(1, Math.min(quantity, maxQty));
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantityKg: clampedQty } : i
            ),
          };
        }),

      clearCart: () => set({ items: [], selectedIds: [] }),

      toggleSelect: (productId) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(productId)
            ? state.selectedIds.filter((id) => id !== productId)
            : [...state.selectedIds, productId],
        })),

      selectAll: () =>
        set((state) => ({
          selectedIds: state.items.map((i) => i.productId),
        })),

      deselectAll: () => set({ selectedIds: [] }),

      isSelected: (productId) => get().selectedIds.includes(productId),

      areAllSelected: () => {
        const state = get();
        return (
          state.items.length > 0 &&
          state.items.every((i) => state.selectedIds.includes(i.productId))
        );
      },

      total: () =>
        get().items.reduce(
          (sum, item) => sum + item.pricePerKg * item.quantityKg,
          0
        ),

      selectedItems: () => {
        const state = get();
        return state.items.filter((i) => state.selectedIds.includes(i.productId));
      },

      selectedTotal: () => {
        const state = get();
        return state.items
          .filter((i) => state.selectedIds.includes(i.productId))
          .reduce((sum, item) => sum + item.pricePerKg * item.quantityKg, 0);
      },

      selectedCount: () => get().selectedIds.length,
    }),
    { name: 'farmflow-cart' }
  )
);
