"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function MobileMenu({ isOpen, onClose, collections, activeCollection, setActiveCollection }) {
  const router = useRouter();
  const { setCartOpen } = useCart();

  const handleNavigation = (collection) => {
    setActiveCollection(collection);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* الخلفية المعتمة */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black cursor-pointer"
            onClick={handleClose}
          />

          {/* الدروير الجانبي */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: [0.32, 0.94, 0.6, 1] }}
            className="relative w-4/5 max-w-xs h-full bg-luxury-cream border-r border-neutral-200 shadow-2xl p-6 flex flex-col"
          >
            {/* رأس القائمة مع زر الإغلاق */}
            <div className="flex justify-between items-center border-b border-neutral-200/60 pb-4 mb-6">
              <span className="text-xs tracking-[0.4em] uppercase text-luxury-gold font-light">Menu</span>
              <button onClick={handleClose} className="text-[10px] tracking-widest text-luxury-gray hover:text-luxury-dark uppercase transition">
                Close ✕
              </button>
            </div>

            {/* روابط القائمة */}
            <nav className="flex-1 flex flex-col gap-6 text-sm tracking-widest uppercase font-light text-luxury-gray">
              {/* Home */}
              <button
                onClick={() => {
                  setActiveCollection('all');
                  router.push('/');
                  onClose();
                }}
                className="text-left hover:text-luxury-dark transition-colors border-b border-transparent hover:border-luxury-gold pb-1"
              >
                Home
              </button>

              {/* All */}
              <button
                onClick={() => handleNavigation('all')}
                className={`text-left hover:text-luxury-dark transition-colors border-b border-transparent hover:border-luxury-gold pb-1 ${activeCollection === 'all' ? 'text-luxury-dark border-luxury-gold' : ''}`}
              >
                All Collections
              </button>

              {/* New Arrivals */}
              <button
                onClick={() => handleNavigation('__new__')}
                className={`text-left hover:text-luxury-dark transition-colors border-b border-transparent hover:border-luxury-gold pb-1 flex items-center gap-2 ${activeCollection === '__new__' ? 'text-luxury-dark border-luxury-gold' : ''}`}
              >
                <span className="text-amber-500">✦</span> New Arrivals
              </button>

              {/* Collections من Firebase */}
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleNavigation(col.name)}
                  className={`text-left hover:text-luxury-dark transition-colors border-b border-transparent hover:border-luxury-gold pb-1 flex items-center gap-2 ${activeCollection === col.name ? 'text-luxury-dark border-luxury-gold' : ''}`}
                >
                  {col.name}
                  {col.isNew && <span className="bg-amber-200 text-amber-800 text-[8px] px-1.5 py-0.5 rounded-full font-bold">NEW</span>}
                </button>
              ))}
            </nav>

            {/* روابط إضافية أسفل */}
            <div className="border-t border-neutral-200/60 pt-6 mt-6 flex justify-between text-[10px] tracking-widest text-neutral-400">
              <button onClick={() => { setCartOpen(true); onClose(); }} className="hover:text-luxury-dark transition">
                Bag
              </button>
              <button onClick={() => { router.push('/search'); onClose(); }} className="hover:text-luxury-dark transition">
                Search
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
