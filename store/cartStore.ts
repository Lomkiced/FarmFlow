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
  minOrderQty?: number;
  wholesalePrice?: number | null;
  wholesaleMinQty?: number | null;
}

export function getItemUnitPrice(item: CartItem): number {
  if (
    item.wholesalePrice &&
    item.wholesaleMinQty &&
    item.quantityKg >= item.wholesaleMinQty
  ) {
    return Number(item.wholesalePrice);
  }
  return item.pricePerKg;
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
  getItemPrice: (item: CartItem) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedIds: [],

      addItem: (item) =>
        set((state) => {
          const minQty = (item.minOrderQty && item.minOrderQty > 1) ? item.minOrderQty : (item.minOrderQty ?? 0.25);
          const initialQty = Number(Math.max(item.quantityKg || minQty, minQty).toFixed(2));
          const exists = state.items.find(
            (i) => i.productId === item.productId
          );
          if (exists) {
            const addedQty = item.quantityKg || minQty;
            const newQty = Number(
              Math.min(
                exists.quantityKg + addedQty,
                item.stockKg > 0 ? item.stockKg : 9999
              ).toFixed(2)
            );
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      quantityKg: newQty,
                      stockKg: item.stockKg,
                      minOrderQty: item.minOrderQty ?? i.minOrderQty,
                      wholesalePrice: item.wholesalePrice !== undefined ? item.wholesalePrice : i.wholesalePrice,
                      wholesaleMinQty: item.wholesaleMinQty !== undefined ? item.wholesaleMinQty : i.wholesaleMinQty,
                    }
                  : i
              ),
              // Auto-select newly added item
              selectedIds: state.selectedIds.includes(item.productId)
                ? state.selectedIds
                : [...state.selectedIds, item.productId],
            };
          }
          return {
            items: [...state.items, { ...item, quantityKg: initialQty }],
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
          const minQty = (item.minOrderQty && item.minOrderQty > 1) ? item.minOrderQty : (item.minOrderQty ?? 0.25);
          const maxQty = item.stockKg > 0 ? item.stockKg : 9999;
          const clampedQty = Number(Math.max(minQty, Math.min(quantity, maxQty)).toFixed(2));
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

      getItemPrice: (item: CartItem) => getItemUnitPrice(item),

      total: () =>
        get().items.reduce(
          (sum, item) => sum + getItemUnitPrice(item) * item.quantityKg,
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
          .reduce((sum, item) => sum + getItemUnitPrice(item) * item.quantityKg, 0);
      },

      selectedCount: () => get().selectedIds.length,
    }),
    { name: 'farmflow-cart' }
  )
);
