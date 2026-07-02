"use client";
import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.title === product.title);
      if (existingItem) {
        return prevItems.map((item) =>
          item.title === product.title ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (title) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.title !== title));
  };

  const updateQuantity = (title, quantity) => {
    if (quantity <= 0) {
      removeFromCart(title);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.title === title ? { ...item, quantity } : item))
    );
  };

  // 👇 دالة جديدة لتفريغ السلة
  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => {
    // العملة دلوقتي هتكون رقم صرف (ج.م) – بنفترض إن السعر متخزن كـ number
    const priceNum = typeof item.price === 'number' ? item.price : parseFloat(item.price);
    return total + priceNum * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartOpen,
      setCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,   // <-- هنا
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);