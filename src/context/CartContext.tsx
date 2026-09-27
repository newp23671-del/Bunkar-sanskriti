import React, { createContext, useContext, useEffect, useState } from 'react';
import type { CartItem, Product } from '../types/index.ts';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: string) => void;
  removeFromCart: (productId: string, selectedVariant?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariant?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalCount: number;
  subtotal: number;
  hasUnpricedItems: boolean;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isCartOpen: false,
  setIsCartOpen: () => {},
  totalCount: 0,
  subtotal: 0,
  hasUnpricedItems: false,
});

const CART_STORAGE_KEY = 'bunkar_sanskriti_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1, selectedVariant?: string) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedVariant === selectedVariant
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity, selectedVariant }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedVariant?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.selectedVariant === selectedVariant))
    );
  };

  const updateQuantity = (productId: string, quantity: number, selectedVariant?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedVariant);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id === productId && i.selectedVariant === selectedVariant) {
          return { ...i, quantity };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const subtotal = items.reduce((acc, curr) => {
    const price = curr.product.salePrice ?? curr.product.price ?? 0;
    return acc + price * curr.quantity;
  }, 0);

  const hasUnpricedItems = items.some((i) => i.product.price === null);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalCount,
        subtotal,
        hasUnpricedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
