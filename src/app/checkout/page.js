"use client";
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart = [], cartCount = 0 } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // 🛡️ حماية من الـ SSR/Prerender: الانتظار حتى تحميل المكون بالكامل في المتصفح
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // منع السيرفر من محاولة قراءة السلة قبل تحميل المتصفح
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center font-serif text-luxury-dark">
        <p className="text-xs tracking-[0.3em] uppercase opacity-60">Loading Checkout...</p>
      </div>
    );
  }

  // إذا كانت السلة فارغة بعد التحميل
  if (!cart || cart?.length === 0) {
    return (
      <div className="min-h-screen bg-luxury-cream flex flex-col items-center justify-center font-serif text-luxury-dark px-4">
        <h1 className="text-xl tracking-[0.3em] uppercase mb-4 font-light">Your Bag is Empty</h1>
        <p className="text-xs tracking-widest text-luxury-gray uppercase mb-8">Please add items to your bag before checking out.</p>
        <Link 
          href="/" 
          className="px-8 py-3 border border-luxury-dark text-[10px] tracking-[0.3em] uppercase hover:bg-luxury-dark hover:text-white transition-all duration-300"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // حساب الإجمالي بأمان مع حماية من الأخطاء
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = typeof item?.price === 'number' ? item.price : parseFloat(item?.price || 0);
    return sum + (itemPrice * (item?.quantity || 1));
  }, 0);

  return (
    <div className="min-h-screen bg-luxury-cream text-luxury-dark font-serif py-16 px-6 md:px-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl tracking-[0.4em] uppercase text-center mb-12 font-light">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* تفاصيل الطلب */}
          <div className="space-y-6">
            <h2 className="text-xs tracking-[0.3em] uppercase text-luxury-gold border-b border-neutral-200 pb-2">
              Order Summary ({cartCount})
            </h2>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.id}-${item.selectedSize}-${index}`} className="flex justify-between items-center text-xs tracking-wider border-b border-neutral-100 pb-3">
                  <div>
                    <p className="uppercase font-light">{item.title}</p>
                    <p className="text-[10px] text-luxury-gray uppercase mt-0.5">Size: {item.selectedSize}</p>
                    <p className="text-[10px] text-luxury-gray uppercase">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-light">
                    {((typeof item.price === 'number' ? item.price : parseFloat(item.price || 0)) * item.quantity).toLocaleString()} ج.م
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-luxury-dark/20 flex justify-between items-center text-sm tracking-widest uppercase font-light">
              <span>Total</span>
              <span>{subtotal.toLocaleString()} ج.م</span>
            </div>
          </div>

          {/* نموذج البيانات / الدفع */}
          <div className="space-y-4">
            <h2 className="text-xs tracking-[0.3em] uppercase text-luxury-gold border-b border-neutral-200 pb-2">
              Shipping Information
            </h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="text" 
                placeholder="FULL NAME" 
                className="w-full bg-transparent border border-neutral-300 p-3 text-xs tracking-widest uppercase focus:outline-none focus:border-luxury-dark" 
                required 
              />
              <input 
                type="tel" 
                placeholder="PHONE NUMBER" 
                className="w-full bg-transparent border border-neutral-300 p-3 text-xs tracking-widest uppercase focus:outline-none focus:border-luxury-dark" 
                required 
              />
              <input 
                type="text" 
                placeholder="SHIPPING ADDRESS" 
                className="w-full bg-transparent border border-neutral-300 p-3 text-xs tracking-widest uppercase focus:outline-none focus:border-luxury-dark" 
                required 
              />
              <button 
                type="submit" 
                className="w-full py-4 bg-luxury-dark text-white text-[10px] tracking-[0.3em] uppercase hover:bg-luxury-gold transition-colors duration-300 font-light mt-6"
              >
                Place Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
