"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  designUrl?: string;
  previewUrl?: string;
  designData?: string;
  printSide?: string;
  customText?: string;
}

interface CartStore {
  items: CartItem[];
  promoCode: string;
  discountAmount: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateDesign: (id: string, designUrl: string, designData?: string, previewUrl?: string) => void;
  clearCart: () => void;
  applyPromo: (code: string, discount: number) => void;
  removePromo: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: "",
      discountAmount: 0,

      addItem: (item) => {
        const id = crypto.randomUUID();
        set((state) => ({ items: [...state.items, { ...item, id }] }));
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      updateDesign: (id, designUrl, designData, previewUrl) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, designUrl, designData, previewUrl } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], promoCode: "", discountAmount: 0 }),

      applyPromo: (code, discount) => set({ promoCode: code, discountAmount: discount }),

      removePromo: () => set({ promoCode: "", discountAmount: 0 }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "printora-cart",
    }
  )
);
