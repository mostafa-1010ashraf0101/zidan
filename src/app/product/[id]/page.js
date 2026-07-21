"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  // جلب المنتج والتوصيات
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
          
          // تحديد المقاس الأول افتراضياً إذا كانت المقاسات موجودة
          if (productData.sizes) {
            const sizeList = typeof productData.sizes === 'string' 
              ? productData.sizes.split(',') 
              : productData.sizes;
            if (sizeList.length > 0) {
              setSelectedSize(sizeList[0].trim().toUpperCase());
            }
          }

          // جلب منتجات مقترحة
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
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-xs tracking-widest text-luxury-gray uppercase">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-serif text-xs tracking-widest text-luxury-gray uppercase">Product Not Found</div>;

  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder.jpg'];
  const priceDisplay = typeof product.price === 'number' ? `${product.price.toLocaleString()} ج.م` : product.price;

  return (
    <main className="bg-luxury-cream min-h-screen text-luxury-dark font-serif py-12 px-6 md:px-16">
      
      <button onClick={() => router.back()} className="text-[10px] tracking-[0.3em] uppercase text-luxury-gray hover:text-luxury-dark mb-12 transition">
        ← Back to Collection
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto mb-32">
        
        {/* معرض الصور */}
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

          {/* المصغرات Thumbnails */}
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

        {/* التفاصيل */}
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

          {/* عرض المقاسات الديناميكية */}
          {product.sizes && (
            <div className="mb-8">
              <span className="text-[10px] tracking-[0.3em] uppercase text-luxury-gray block mb-3 font-light">Select Size</span>
              <div className="flex gap-4">
                {(typeof product.sizes === 'string' 
                  ? product.sizes.split(',') 
                  : product.sizes
                ).map((size) => {
                  const cleanSize = size.trim().toUpperCase();
                  return (
                    <button 
                      key={cleanSize}
                      onClick={() => setSelectedSize(cleanSize)}
                      className={`w-10 h-10 border text-xs font-sans flex items-center justify-center transition-all ${selectedSize === cleanSize ? 'bg-luxury-dark text-white border-transparent' : 'border-neutral-200 hover:border-luxury-dark text-luxury-dark'}`}
                    >
                      {cleanSize}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* تفاصيل المادة والعناية */}
          {product.details && product.details.length > 0 && (
            <div className="mb-8">
              <span className="text-[10px] tracking-[0.3em] uppercase text-luxury-gray block mb-3 font-light">Composition & Care</span>
              <ul className="text-xs tracking-wider text-neutral-500 space-y-2 font-light">
                {product.details.map((detail, index) => (
                  <li key={index}>• {detail}</li>
                ))}
              </ul>
            </div>
          )}

          <button 
            onClick={() => addToCart({ 
              id: product.id, 
              title: product.title, 
              collection: product.collection, 
              price: product.price, 
              image1: images[0],
              selectedSize 
            })}
            className="w-full bg-luxury-dark text-white text-[10px] tracking-[0.3em] uppercase py-4 border border-transparent hover:bg-transparent hover:text-luxury-dark hover:border-luxury-dark transition-all duration-300 font-light mt-4"
          >
            Add to Shopping Bag
          </button>
        </div>
      </div>

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
