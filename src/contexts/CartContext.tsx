"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CartItemType = "course" | "bundle";

export interface CartItem {
  type: CartItemType;
  id: string;
  title: string;
  price: number;
  image_url?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (
    type: CartItemType,
    id: string,
    title: string,
    price: number,
    image_url?: string | null
  ) => void;
  removeFromCart: (type: CartItemType, id: string) => void;
  clearCart: () => void;
  isInCart: (type: CartItemType, id: string) => boolean;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "earnyour_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [items, mounted]);

  const addToCart = (
    type: CartItemType,
    id: string,
    title: string,
    price: number,
    image_url?: string | null
  ) => {
    setItems((prev) => {
      // Check if item already exists
      const exists = prev.some((item) => item.type === type && item.id === id);
      if (exists) {
        return prev; // Don't add duplicates
      }
      return [...prev, { type, id, title, price, image_url }];
    });
  };

  const removeFromCart = (type: CartItemType, id: string) => {
    setItems((prev) => prev.filter((item) => !(item.type === type && item.id === id)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (type: CartItemType, id: string) => {
    return items.some((item) => item.type === type && item.id === id);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const getItemCount = () => {
    return items.length;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

