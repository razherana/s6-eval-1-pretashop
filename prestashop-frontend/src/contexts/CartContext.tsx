// src/contexts/CartContext.tsx
import { createContext } from "react";

export interface CartItem {
  productId: number;
  combinationId?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  reference: string;
  combinationReference?: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (productId: number, combinationId?: number) => void;
  updateQuantity: (
    productId: number,
    combinationId: number | undefined,
    quantity: number,
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isLoadingCart?: boolean;
  cartId: number | null;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);