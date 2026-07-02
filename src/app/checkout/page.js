// app/checkout/page.js
"use client";
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', address: '', city: '', phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // التحقق من صلاحية الكوبون
  const applyCoupon = async () => {
    if (!couponCode) return toast.error('Please enter a coupon code.');
    try {
      const couponRef = doc(db, 'coupons', couponCode.toUpperCase());
      const couponSnap = await getDoc(couponRef);
      if (!couponSnap.exists()) {
        return toast.error('Invalid coupon code.');
      }
      const data = couponSnap.data();
      if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        return toast.error('This coupon has expired.');
      }
      setDiscount(data.discount || 0);
      setCouponApplied(true);
      toast.success(`Coupon applied! ${data.discount}% off.`);
    } catch (error) {
      toast.error('Error applying coupon.');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error('Your bag is empty.');
    if (!formData.firstName || !formData.email || !formData.address || !formData.phone) {
      return toast.error('Please fill in all required fields.');
    }

    setLoading(true);
    try {
      // 1. إنشاء الطلب
      const finalTotal = cartTotal * (1 - discount / 100);
      const docRef = await addDoc(collection(db, "orders"), {
        clientInfo: formData,
        items: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          collection: item.collection,
          price: item.price,
          quantity: item.quantity
        })),
        total: finalTotal,
        originalTotal: cartTotal,
        discount: discount,
        couponCode: couponApplied ? couponCode : null,
        status: "Processing",
        createdAt: serverTimestamp()
      });

      // 2. تحديث المخزون
      for (const item of cartItems) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const currentStock = productSnap.data().stock || 0;
          await updateDoc(productRef, { 
            stock: Math.max(0, currentStock - item.quantity)
          });
        }
      }

      toast.success(`Order placed successfully! ID: ${docRef.id}`);
      clearCart();
      router.push('/');
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-luxury-cream min-h-screen text-luxury-dark font-serif py-16 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="text-[10px] tracking-[0.3em] uppercase text-luxury-gray hover:text-luxury-dark mb-12 transition">
          ← Return to Store
        </button>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h2 className="text-xs tracking-[0.4em] uppercase text-luxury-gold font-light mb-6">01. Shipping Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] tracking-widest text-luxury-gray uppercase font-light">First Name *</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="bg-transparent border-b border-neutral-300 pb-2 text-xs font-light outline-none focus:border-luxury-dark transition" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] tracking-widest text-luxury-gray uppercase font-light">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="bg-transparent border-b border-neutral-300 pb-2 text-xs font-light outline-none focus:border-luxury-dark transition" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[9px] tracking-widest text-luxury-gray uppercase font-light">Email Address *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="bg-transparent border-b border-neutral-300 pb-2 text-xs font-light outline-none focus:border-luxury-dark transition" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[9px] tracking-widest text-luxury-gray uppercase font-light">Delivery Address *</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} className="bg-transparent border-b border-neutral-300 pb-2 text-xs font-light outline-none focus:border-luxury-dark transition" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] tracking-widest text-luxury-gray uppercase font-light">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="bg-transparent border-b border-neutral-300 pb-2 text-xs font-light outline-none focus:border-luxury-dark transition" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] tracking-widest text-luxury-gray uppercase font-light">Phone Number *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="bg-transparent border-b border-neutral-300 pb-2 text-xs font-light outline-none focus:border-luxury-dark transition" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-luxury-dark text-white text-[10px] tracking-[0.3em] uppercase py-4 border border-transparent hover:bg-neutral-800 transition-all duration-300 font-light disabled:bg-neutral-400">
              {loading ? "Processing Prestige..." : "Place Order & Pay"}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white/40 p-8 border border-neutral-200/50 h-fit space-y-6">
              <h2 className="text-xs tracking-[0.4em] uppercase text-luxury-gold font-light mb-6">02. Order Summary</h2>
              
              {cartItems.length === 0 ? (
                <p className="text-xs tracking-wider text-luxury-gray font-light">No prestige items selected.</p>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id || item.title} className="flex justify-between items-center border-b border-neutral-200/40 pb-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-16 bg-cover bg-center border border-neutral-200/40" style={{ backgroundImage: `url(${item.image1 || item.images?.[0]})` }} />
                        <div>
                          <h4 className="text-xs tracking-wide uppercase text-luxury-dark font-light line-clamp-1">{item.title}</h4>
                          <span className="text-[10px] text-luxury-gray font-light">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="text-xs font-light text-luxury-dark">{item.price.toLocaleString()} ج.م</span>
                    </div>
                  ))}
                </div>
              )}

              {/* حقل الكوبون */}
              <div className="pt-4 border-t border-neutral-200/40">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Promo Code"
                    className="flex-1 bg-transparent border-b border-neutral-300 pb-2 text-xs font-light outline-none focus:border-luxury-dark transition"
                    disabled={couponApplied}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponApplied}
                    className="border border-luxury-dark px-4 py-1 text-[10px] uppercase tracking-wider hover:bg-luxury-dark hover:text-white transition disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[10px] text-emerald-600 mt-2">✓ Coupon applied! {discount}% off</p>
                )}
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-xs font-light">
                  <span className="text-luxury-gray uppercase tracking-wider">Subtotal</span>
                  <span className="text-luxury-dark">{cartTotal.toLocaleString()} ج.م</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs font-light text-emerald-600">
                    <span className="uppercase tracking-wider">Discount ({discount}%)</span>
                    <span>-{(cartTotal * discount / 100).toLocaleString()} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-light">
                  <span className="text-luxury-gray uppercase tracking-wider">Shipping</span>
                  <span className="text-luxury-dark">Complimentary</span>
                </div>
                <div className="w-full h-[1px] bg-neutral-200 my-4" />
                <div className="flex justify-between text-xs font-light">
                  <span className="text-luxury-gray uppercase tracking-wider">Total</span>
                  <span className="text-luxury-dark font-medium">
                    {(cartTotal * (1 - discount / 100)).toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}