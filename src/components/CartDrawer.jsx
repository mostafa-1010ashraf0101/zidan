"use client";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { cartItems, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const router = useRouter();

  return (
    <div className={`fixed inset-0 z-50 ${cartOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: cartOpen ? 0.4 : 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-black cursor-pointer"
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: cartOpen ? "0%" : "100%" }}
        transition={{ duration: 0.5, ease: [0.32, 0.94, 0.6, 1] }}
        className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-luxury-cream border-l border-neutral-200 shadow-2xl flex flex-col justify-between"
      >
        <div className="p-6 border-b border-neutral-200/60 flex justify-between items-center select-none">
          <span className="text-xs tracking-[0.3em] uppercase text-luxury-dark font-light">Shopping Bag</span>
          <button onClick={() => setCartOpen(false)} className="text-[10px] tracking-widest text-luxury-gray hover:text-luxury-dark uppercase transition">
            Close ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center select-none">
                <p className="text-xs tracking-[0.25em] text-luxury-gray uppercase font-light mb-2">Your bag is empty</p>
                <p className="text-[11px] tracking-wide text-neutral-400 font-serif italic lowercase">curate your inaugural collection.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="flex items-center gap-4 bg-white/50 p-3 border border-neutral-200/40"
                >
                  <div className="w-20 h-24 bg-cover bg-center border border-neutral-200/40" style={{ backgroundImage: `url(${item.image})` }} />
                  <div className="flex-1 flex flex-col align-baseline">
                    <span className="text-[9px] tracking-[0.3em] uppercase text-luxury-gold mb-1">{item.collection}</span>
                    <h4 className="text-xs tracking-wide text-luxury-dark font-light uppercase line-clamp-1">{item.title}</h4>
                    <span className="text-xs text-luxury-gray font-light mt-1">
                      {typeof item.price === 'number' ? `${item.price.toLocaleString()} ج.م` : item.price}
                    </span>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-xs font-light text-neutral-400 hover:text-luxury-dark">─</button>
                      <span className="text-xs font-sans text-luxury-dark scale-90">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-xs font-light text-neutral-400 hover:text-luxury-dark">┼</button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-neutral-400 hover:text-rose-700 tracking-wider transition uppercase font-light pr-2">
                    Remove
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-neutral-200/60 bg-white select-none">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[11px] tracking-[0.2em] text-luxury-gray uppercase font-light">Subtotal</span>
            <span className="text-xs tracking-widest text-luxury-dark font-light">
              {typeof cartTotal === 'number' ? `${cartTotal.toLocaleString()} ج.م` : cartTotal}
            </span>
          </div>
          <button 
            onClick={() => {
              setCartOpen(false);
              router.push('/checkout');
            }}
            className="w-full bg-luxury-dark text-white text-[10px] tracking-[0.3em] uppercase py-4 border border-transparent hover:bg-transparent hover:text-luxury-dark hover:border-luxury-dark transition-all duration-300 font-light"
          >
            Proceed to Checkout
          </button>
        </div>
      </motion.div>
    </div>
  );
}