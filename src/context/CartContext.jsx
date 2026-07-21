"use client";
import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // دوال سريعة للتحكم في فتح وإغلاق السلة
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  // إضافة منتج للسلة
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // التأكد من توحيد مسمى الصورة
      const productImage =
        product.image ||
        product.image1 ||
        (product.images && product.images[0]) ||
        '/placeholder.jpg';

      const itemSize = product.selectedSize || 'OS'; // OS = One Size لو مفيش مقاس

      // البحث عن عنصر يطابق الـ id والـ size معاً
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.selectedSize === itemSize
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      }

      return [
        ...prevItems,
        {
          ...product,
          image: productImage,
          selectedSize: itemSize,
          quantity: 1,
        },
      ];
    });

    // فتح السلة تلقائياً عند الإضافة
    setCartOpen(true);
  };

  // حذف منتج بحسب الـ ID والمقاس
  const removeFromCart = (id, selectedSize) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === id && item.selectedSize === selectedSize)
      )
    );
  };

  // تحديث الكمية (الزائد والناقص)
  const updateQuantity = (id, selectedSize, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id, selectedSize);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id && item.selectedSize === selectedSize) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // تفريغ السلة
  const clearCart = () => {
    setCartItems([]);
  };

  // إجمالي عدد العناصر
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // إجمالي السعر
  const cartTotal = cartItems.reduce((total, item) => {
    const priceNum =
      typeof item.price === 'number'
        ? item.price
        : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
    return total + priceNum * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartOpen,
        setCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
