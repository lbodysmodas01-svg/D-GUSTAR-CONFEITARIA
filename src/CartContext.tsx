import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem } from './types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, customization?: Partial<CartItem>) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MenuItem, customization?: Partial<CartItem>) => {
    const cartId = `${item.id}-${Date.now()}`;
    const newItem: CartItem = {
      ...item,
      cartId,
      quantity: 1,
      ...customization,
    };
    setCart((prev) => [...prev, newItem]);
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
