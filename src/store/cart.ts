import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  maxQuantity: number;
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  resetCart: () => void;
}

export const useCart = create<StoreState, [["zustand/persist", StoreState]]>(
  persist<StoreState>(
    (set) => ({
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find(
            (cartItem) => cartItem.id === item.id
          );
          if (
            existingItem &&
            existingItem.quantity === existingItem.maxQuantity
          ) {
            toast.error(`Can't Add More  ${existingItem.name}`);

            return { cart: state.cart };
          }
          if (existingItem) {
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem
              ),
            };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }),
      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),
      resetCart: () => set({ cart: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);
