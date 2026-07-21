"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // استرجاع السلة من الـ LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('zidan_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart storage", e);
      }
    }
  }, []);

  // حفظ السلة في الـ LocalStorage
  useEffect(() => {
    localStorage.setItem('zidan_cart', JSON.stringify(cart));
  }, [cart]);

  // دالة الإضافة الإجبارية
  const addToCart = (product) => {
    // 🛡️ الحارس الرئيسي (Guard): منع أي عملية إضافة بدون selectedSize من أي مكان بالموقع
    if (!product.selectedSize || product.selectedSize.trim() === '' || product.selectedSize === 'FREE SIZE') {
      console.warn("Blocked attempt to add item without size selection.");
      return false; // رفض العملية فوراً
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.selectedSize === product.selectedSize
      );

      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += product.quantity || 1;
        return updatedCart;
      }

      return [...prevCart, { ...product, quantity: product.quantity || 1 }];
    });

    setCartOpen(true);
    return true;
  };

  const removeFromCart = (id, selectedSize) => {
    setCart((prevCart) => 
      prevCart.filter((item) => !(item.id === id && item.selectedSize === selectedSize))
    );
  };

  const updateQuantity = (id, selectedSize, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id && item.selectedSize === selectedSize) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartOpen,
        setCartOpen,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
