"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { cartItems, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const router = useRouter();

  // منع التمرير في خلفية الصفحة عند فتح السلة
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [cartOpen]);

  // معالجة زر الدفع والسلاسة في الانتقال
  const handleCheckout = () => {
    setCartOpen(false);
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* الخلفية المظلمة */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-black cursor-pointer"
          />

          {/* النافذة الجانبية */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.32, 0.94, 0.6, 1] }}
            className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-luxury-cream border-l border-neutral-200 shadow-2xl flex flex-col justify-between"
          >
            {/* الهيدر */}
            <div className="p-6 border-b border-neutral-200/60 flex justify-between items-center select-none">
              <span className="text-xs tracking-[0.3em] uppercase text-luxury-dark font-light">
                Shopping Bag
              </span>
              <button 
                type="button"
                onClick={() => setCartOpen(false)} 
                className="text-[10px] tracking-widest text-luxury-gray hover:text-luxury-dark uppercase transition focus:outline-none"
                aria-label="Close Shopping Bag"
              >
                Close ✕
              </button>
            </div>

            {/* قائمة المنتجات */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence mode="popLayout">
                {cartItems.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center select-none py-12"
                  >
                    <p className="text-xs tracking-[0.25em] text-luxury-gray uppercase font-light mb-2">
                      Your bag is empty
                    </p>
                    <p className="text-[11px] tracking-wide text-neutral-400 font-serif italic lowercase">
                      curate your inaugural collection.
                    </p>
                  </motion.div>
                ) : (
                  cartItems.map((item) => {
                    const imageUrl = item.image || item.image1 || (item.images && item.images[0]) || '/placeholder.jpg';
                    const itemKey = `${item.id}-${item.selectedSize || 'default'}`;
                    const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;

                    return (
                      <motion.div 
                        key={itemKey}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-4 bg-white/50 p-3 border border-neutral-200/40"
                      >
                        {/* الصورة */}
                        <div className="w-20 h-24 relative bg-neutral-100 border border-neutral-200/40 flex-shrink-0 overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={item.title || 'Product'}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        {/* التفاصيل */}
                        <div className="flex-1 flex flex-col justify-center">
                          <span className="text-[9px] tracking-[0.3em] uppercase text-luxury-gold mb-0.5">
                            {item.collection}
                          </span>
                          <h3 className="text-xs tracking-wide text-luxury-dark font-light uppercase line-clamp-1">
                            {item.title}
                          </h3>
                          
                          {item.selectedSize && (
                            <span className="text-[10px] tracking-widest text-luxury-gray uppercase font-sans mt-0.5">
                              Size: {item.selectedSize}
                            </span>
                          )}

                          <span className="text-xs text-luxury-gray font-light mt-1">
                            {itemPrice.toLocaleString()} ج.م
                          </span>
                          
                          {/* التحكم بالكمية */}
                          <div className="flex items-center gap-3 mt-3">
                            <button 
                              type="button"
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} 
                              className="w-6 h-6 border border-neutral-200 flex items-center justify-center text-xs font-light text-neutral-600 hover:text-luxury-dark hover:border-luxury-dark transition"
                              aria-label="Decrease quantity"
                            >
                              ─
                            </button>
                            <span className="text-xs font-sans text-luxury-dark min-w-[12px] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              type="button"
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} 
                              className="w-6 h-6 border border-neutral-200 flex items-center justify-center text-xs font-light text-neutral-600 hover:text-luxury-dark hover:border-luxury-dark transition"
                              aria-label="Increase quantity"
                            >
                              ┼
                            </button>
                          </div>
                        </div>

                        {/* زر الحذف */}
                        <button 
                          type="button"
                          onClick={() => removeFromCart(item.id, item.selectedSize)} 
                          className="text-[10px] text-neutral-400 hover:text-rose-700 tracking-wider transition uppercase font-light pr-2 self-start pt-1"
                        >
                          Remove
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* الجزء السفلي والدفع */}
            <div className="p-6 border-t border-neutral-200/60 bg-white select-none">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[11px] tracking-[0.2em] text-luxury-gray uppercase font-light">
                  Subtotal
                </span>
                <span className="text-xs tracking-widest text-luxury-dark font-light">
                  {typeof cartTotal === 'number' ? `${cartTotal.toLocaleString()} ج.م` : cartTotal}
                </span>
              </div>
              <button 
                type="button"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="w-full bg-luxury-dark text-white text-[10px] tracking-[0.3em] uppercase py-4 border border-transparent hover:bg-transparent hover:text-luxury-dark hover:border-luxury-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-light"
              >
                Proceed to Checkout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
