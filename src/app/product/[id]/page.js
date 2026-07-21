"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, setCartOpen } = useCart();
  
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  
  // حالات الإشعار والخطأ
  const [showToast, setShowToast] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);

          if (productData.collection) {
            const productsRef = collection(db, "products");
            const q = query(productsRef, where("collection", "==", productData.collection));
            const querySnapshot = await getDocs(q);
            const recs = [];
            querySnapshot.forEach((doc) => {
              if (doc.id !== id) {
                recs.push({ id: doc.id, ...doc.data() });
              }
            });
            setRecommendations(recs.slice(0, 3));
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } fontFinally: {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    const hasSizes = product.variants || product.sizes;
    
    // إجبار اختيار المقاس
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2500);
      return;
    }

    setSizeError(false);

    addToCart({ 
      id: product.id, 
      title: product.title, 
      collection: product.collection, 
      price: product.price, 
      image1: images[0],
      selectedSize 
    });

    // إظهار التنبيه
    setShowToast(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-xs tracking-widest text-luxury-gray uppercase">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-serif text-xs tracking-widest text-luxury-gray uppercase">Product Not Found</div>;

  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder.jpg'];
  const priceDisplay = typeof product.price === 'number' ? `${product.price.toLocaleString()} ج.م` : product.price;

  return (
    <main className="bg-luxury-cream min-h-screen text-luxury-dark font-serif py-12 px-6 md:px-16 relative">
      
      <button onClick={() => router.back()} className="text-[10px] tracking-[0.3em] uppercase text-luxury-gray hover:text-luxury-dark mb-12 transition">
        ← Back to Collection
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto mb-32">
        
        {/* صور المنتج */}
        <div className="flex flex-col gap-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8 }}
            className="w-full h-[600px] relative border border-neutral-200/40 overflow-hidden bg-neutral-900/5"
          >
            <Image
              src={images[activeImage]}
              alt={product.title || 'Product Image'}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </motion.div>

          {images.length > 1 && (
            <div className="flex gap-4 flex-wrap">
              {images.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-28 relative cursor-pointer border transition-all overflow-hidden bg-neutral-900/5 ${activeImage === idx ? 'border-luxury-dark' : 'border-neutral-200/40 opacity-60'}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* معلومات المنتج */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-[0.5em] uppercase text-luxury-gold mb-2">{product.collection}</span>
            {product.isNew && <span className="bg-amber-200 text-amber-800 text-[9px] px-2 py-0.5 font-bold tracking-wider uppercase">NEW</span>}
          </div>
          <h1 className="text-2xl md:text-4xl tracking-wide uppercase font-light text-luxury-dark mb-4">{product.title}</h1>
          <p className="text-lg tracking-widest font-light text-luxury-gray mb-8">{priceDisplay}</p>
          
          <div className="w-full h-[1px] bg-neutral-200 mb-8" />

          <p className="text-sm tracking-wide leading-relaxed text-luxury-gray font-light mb-8">
            {product.description}
          </p>

          {/* اختيار المقاسات */}
          {(product.variants || product.sizes) && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] tracking-[0.3em] uppercase text-luxury-gray font-light">
                  Select Size
                </span>
                {sizeError && (
                  <span className="text-[10px] text-rose-600 font-sans tracking-wider animate-bounce">
                    Please select a size
                  </span>
                )}
              </div>
              
              <div className={`flex gap-3 flex-wrap p-1 rounded transition-all ${sizeError ? 'border border-rose-500/50 bg-rose-50/30' : ''}`}>
                {(
                  Array.isArray(product.variants || product.sizes)
                    ? (product.variants || product.sizes)
                    : String(product.variants || product.sizes).split(',')
                ).map((sizeItem) => {
                  const cleanSize = String(sizeItem).trim().toUpperCase();
                  if (!cleanSize) return null;

                  return (
                    <button 
                      key={cleanSize}
                      type="button"
                      onClick={() => {
                        setSelectedSize(cleanSize);
                        setSizeError(false);
                      }}
                      className={`min-w-[40px] h-10 px-3 border text-xs font-sans flex items-center justify-center transition-all ${
                        selectedSize === cleanSize 
                          ? 'bg-luxury-dark text-white border-transparent shadow-sm' 
                          : 'border-neutral-200 hover:border-luxury-dark text-luxury-dark bg-white'
                      }`}
                    >
                      {cleanSize}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button 
            onClick={handleAddToCart}
            className="w-full bg-luxury-dark text-white text-[10px] tracking-[0.3em] uppercase py-4 border border-transparent hover:bg-transparent hover:text-luxury-dark hover:border-luxury-dark transition-all duration-300 font-light mt-4"
          >
            Add to Shopping Bag
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-luxury-dark text-white px-6 py-4 shadow-2xl border border-neutral-700 flex items-center gap-4"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-xs tracking-widest uppercase font-light">Added to Bag</p>
              <p className="text-[10px] text-neutral-400 font-sans mt-0.5">{product.title} {selectedSize ? `(${selectedSize})` : ''}</p>
            </div>
            
            {/* 🟢 الزرار المعدل */}
            <button 
              type="button"
              onClick={() => {
                setShowToast(false); // إخفاء الإشعار
                setCartOpen(true);   // فتح السلة الجانبية
              }}
              className="text-[9px] tracking-widest uppercase text-luxury-gold underline hover:text-white ml-2 font-sans cursor-pointer py-1 px-2"
            >
              View Bag
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* التوصيات */}
      {recommendations.length > 0 && (
        <>
          <div className="w-full h-[1px] bg-neutral-200/60 max-w-6xl mx-auto mb-20" />
          <section className="max-w-6xl mx-auto mb-16">
            <h2 className="text-center text-xs tracking-[0.4em] uppercase text-luxury-gold mb-16 font-light">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {recommendations.map((rec) => (
                <ProductCard 
                  key={rec.id}
                  id={rec.id}
                  title={rec.title}
                  collection={rec.collection}
                  price={rec.price}
                  image1={rec.images?.[0] || ''}
                  image2={rec.images?.[1] || ''}
                  isNew={rec.isNew}
                />
              ))}
            </div>
          </section>
        </>
      )}

    </main>
  );
}
