"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. استرجاع السلة آمنًا من الـ LocalStorage عند بدء التشغيل على المتصفح فقط
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('zidan_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to parse cart storage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 2. حفظ السلة فقط بعد اكتمال التحميل الأولي (تجنب مسح السلة عند الـ Refresh)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('zidan_cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // دالة الإضافة مع فحص المقاس
  const addToCart = (product) => {
    // منع الإضافة فقط إذا لم يتم تحديد مقاس وكان المطلوب تحديد مقاس
    if (!product.selectedSize || product.selectedSize.trim() === '') {
      console.warn("Blocked attempt to add item without size selection.");
      return false;
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

  // 3. تعديل الكمية مباشرة بشكل يتوافق مع زر الـ (+) والـ (─) في CartDrawer
  const updateQuantity = (id, selectedSize, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id, selectedSize);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id && item.selectedSize === selectedSize) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // إجمالي عدد القطع
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  // 4. حساب المجموع الكلي مالياً بشكل دقيق للـ Checkout والـ Drawer
  const cartTotal = cart.reduce((total, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    return total + price * (item.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart, // متوافق مع المكونات الخارجية
        addToCart,
        removeFromCart,
        updateQuantity,
        cartOpen,
        setCartOpen,
        cartCount,
        cartTotal
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
