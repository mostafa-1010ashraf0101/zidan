"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/SplashScreen';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import SearchOverlay from '@/components/SearchOverlay';
import { useCart } from '@/context/CartContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// 1. نقل السلايدات خارج المكون لتجنب إعادة التعريف وإعادة تشغيل التايمر عند أي State Change
const HERO_SLIDES = [
  { type: 'content' },
  { type: 'video', src: '/videos/ferrari zidan.mp4' },  
  { type: 'video', src: '/videos/graffiti t-shirt (online-video-cutter.com).mp4' }, 
  { type: 'video', src: '/videos/mona lisa vid.mp4' }, 
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setCartOpen, cartCount } = useCart();
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState('all');

  // حالة السلايدر الحالي (0 إلى 3)
  const [currentSlide, setCurrentSlide] = useState(0);

  // للانتقال للسلايد التالي
  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  // 2. التغيير التلقائي: 8 ثوانٍ فقط لو كان السلايد الحالي عبارة عن "محتوى نصي"
  useEffect(() => {
    if (loading) return;
    
    // إذا كان السلايد فيديو، سنتحكم بالانتقال عن طريق حدث onEnded الخاص بالفيديو نفسه
    if (HERO_SLIDES[currentSlide].type === 'video') return;

    const timer = setTimeout(() => {
      handleNextSlide();
    }, 8000);

    return () => clearTimeout(timer);
  }, [loading, currentSlide]);

  // جلب المنتجات لايف من Firebase
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  // جلب الكولكشنز لايف من Firebase
  useEffect(() => {
    const q = query(collection(db, "collections"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cols = [];
      querySnapshot.forEach((doc) => {
        cols.push({ id: doc.id, ...doc.data() });
      });
      setCollections(cols);
    });
    return () => unsubscribe();
  }, []);

  // فلترة المنتجات حسب الكولكشن المختار
  const filteredProducts = activeCollection === 'all' 
    ? products 
    : activeCollection === '__new__' 
    ? products.filter(p => p.isNew === true)
    : products.filter(p => p.collection === activeCollection);

  const newProducts = products.filter(p => p.isNew === true);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <SplashScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="bg-luxury-cream min-h-screen text-luxury-dark font-serif"
        >
          {/* ===== النافبار ===== */}
          <nav className="sticky top-0 bg-luxury-cream/90 backdrop-blur-md z-40 border-b border-neutral-200/60 px-6 md:px-16 py-6 flex justify-between items-center select-none">
            
            {/* زر القائمة للجوال */}
            <div 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden block text-xs tracking-[0.3em] font-light cursor-pointer hover:text-luxury-gold transition z-50"
              role="button"
              aria-label="Toggle Navigation Menu"
            >
              {isMenuOpen ? "CLOSE" : "MENU"}
            </div>
            
            {/* القائمة المنبثقة للموبايل */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  className="md:hidden absolute top-full left-0 w-full bg-luxury-cream border-b border-neutral-200 p-8 flex flex-col gap-6 text-center z-40 shadow-lg"
                >
                  <button onClick={() => { setActiveCollection('all'); setIsMenuOpen(false); }}>ALL</button>
                  {collections.map(col => (
                    <button key={col.id} onClick={() => { setActiveCollection(col.name); setIsMenuOpen(false); }}>{col.name}</button>
                  ))}
                  <button onClick={() => { setActiveCollection('__new__'); setIsMenuOpen(false); }}>NEW ARRIVALS</button>
                  
                  <button 
                    onClick={() => { setSearchOpen(true); setIsMenuOpen(false); }} 
                    className="text-luxury-gold uppercase tracking-widest border-t border-neutral-200 pt-4 mt-2"
                  >
                    SEARCH
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* الروابط الأساسية (ديسكتوب) */}
            <div className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.3em] font-light text-luxury-gray">
              <button 
                onClick={() => setActiveCollection('all')}
                className={`hover:text-luxury-dark transition duration-300 block whitespace-nowrap uppercase tracking-widest ${activeCollection === 'all' ? 'text-luxury-dark border-b border-luxury-gold pb-1' : ''}`}
              >
                All
              </button>

              {collections.map((col) => (
                <button 
                  key={col.id}
                  onClick={() => setActiveCollection(col.name)}
                  className={`hover:text-luxury-dark transition duration-300 block whitespace-nowrap uppercase tracking-widest flex items-center gap-1.5 ${activeCollection === col.name ? 'text-luxury-dark border-b border-luxury-gold pb-1' : ''}`}
                >
                  {col.name}
                  {col.isNew && (
                    <span className="bg-amber-200 text-amber-800 text-[6px] px-1.5 py-0.5 rounded-full font-bold tracking-wider uppercase">NEW</span>
                  )}
                </button>
              ))}

              <button 
                onClick={() => setActiveCollection('__new__')}
                className={`hover:text-luxury-dark transition duration-300 block whitespace-nowrap uppercase tracking-widest flex items-center gap-1.5 ${activeCollection === '__new__' ? 'text-luxury-dark border-b border-luxury-gold pb-1' : ''}`}
              >
                <span className="text-amber-600">✦</span> New Arrivals
                {newProducts.length > 0 && (
                  <span className="bg-amber-200 text-amber-800 text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                    {newProducts.length}
                  </span>
                )}
              </button>
            </div>

            {/* الشعار */}
            <span 
              onClick={() => setActiveCollection('all')}
              className="text-xl md:text-2xl tracking-[0.5em] font-light cursor-pointer text-luxury-dark transition hover:opacity-80 pl-[0.5em]"
            >
              ZIDAN
            </span>

            {/* أيقونات الجانب الأيمن */}
            <div className="flex items-center gap-6 md:gap-10 text-[11px] tracking-[0.3em] font-light text-luxury-gray">
              <button 
                onClick={() => setSearchOpen(true)} 
                className="hidden md:block hover:text-luxury-dark transition duration-300 uppercase tracking-[0.3em] focus:outline-none text-[10px]"
                aria-label="Open Search"
              >
                SEARCH
              </button>
              
              <button 
                onClick={() => setCartOpen(true)} 
                className="relative p-1 text-luxury-dark hover:text-luxury-gold transition duration-300 focus:outline-none" 
                aria-label="Open Shopping Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-luxury-dark text-white font-sans text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center scale-90">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </nav>

          {/* ===== الهيرو سكشن (Hero Slider) ===== */}
          <section className="relative h-[70vh] md:h-[85vh] bg-neutral-900 flex flex-col justify-center items-center text-center px-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full flex items-center justify-center"
              >
                {/* السلايد الأول: المحتوى النصي */}
                {HERO_SLIDES[currentSlide].type === 'content' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 to-neutral-900 opacity-90" />
                    <div className="relative z-10 max-w-3xl px-4">
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ delay: 0.2, duration: 0.8 }} 
                        className="text-xs uppercase tracking-[0.5em] text-luxury-gold mb-4"
                      >
                        {activeCollection === 'all' ? 'The Curated Collection' : 
                         activeCollection === '__new__' ? 'New Arrivals' : 
                         `The ${activeCollection} Collection`}
                      </motion.p>
                      <h1 className="text-3xl md:text-6xl font-extralight tracking-wide text-luxury-cream leading-tight">
                        Crafting Eternity. Defining Prestige.
                      </h1>
                      <div className="h-[1px] bg-luxury-gold mx-auto my-8 w-20" />
                    </div>
                  </>
                )}

                {/* السلايدات من 2 إلى 4: فيديوهات متزامنة التبديل تلقائياً عند الانتهاء */}
                {HERO_SLIDES[currentSlide].type === 'video' && (
                  <div className="relative w-full h-full">
                    <video
                      src={HERO_SLIDES[currentSlide].src}
                      autoPlay
                      muted
                      playsInline
                      onEnded={handleNextSlide} // 👈 التبديل فور انتهاء الفيديو بدقة
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* مؤشرات التنقل (Dots) */}
            <div className="absolute bottom-6 z-20 flex items-center gap-3">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${
                    currentSlide === index ? 'w-8 bg-luxury-gold' : 'w-2 bg-white/40 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </section>

          {/* ===== شبكة المنتجات ===== */}
          <section className="max-w-7xl mx-auto px-6 md:px-16 py-24 md:py-32">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-xs tracking-[0.5em] uppercase text-luxury-gold mb-3 font-light">
                {activeCollection === 'all' ? 'The Complete Edit' : 
                 activeCollection === '__new__' ? 'Fresh Arrivals' : 
                 `${activeCollection} Collection`}
              </h2>
            </div>
            
            {filteredProducts.length === 0 ? (
              <p className="text-center text-xs tracking-widest text-neutral-400 uppercase py-12">
                {activeCollection === '__new__' ? 'No new arrivals yet.' : `No pieces in "${activeCollection}" collection yet.`}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-16 gap-x-12">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    collection={product.collection}
                    price={typeof product.price === 'number' ? product.price : parseFloat(product.price)}
                    image1={product.images?.[0] || ''}
                    image2={product.images?.[1] || ''}
                    isNew={product.isNew || false}
                    sizes={product.sizes || []}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ===== الفوتر ===== */}
          <footer className="border-t border-neutral-200/60 py-12 text-center text-[10px] tracking-[0.3em] uppercase text-luxury-gray bg-white">
            <p>© 2026 ZIDAN Luxury House. All Rights Reserved.</p>
          </footer>

          {/* ===== المكونات التفاعلية ===== */}
          <CartDrawer />
          <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </motion.main>
      )}
    </>
  );
}
