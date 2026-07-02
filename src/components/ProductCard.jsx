"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // استيراد Image
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function ProductCard({ id, title, collection, price, image1, image2, isNew }) {
  const [hovered, setHovered] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  const displayPrice = typeof price === 'number' ? price.toLocaleString() : price;

  return (
    <div 
      onClick={() => router.push(`/product/${id}`)}
      className="group cursor-pointer flex flex-col items-stretch relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-full h-[500px] bg-neutral-900/5 relative overflow-hidden border border-neutral-200/30">
        {isNew && (
          <div className="absolute top-4 left-4 z-30 bg-white/90 px-3 py-1 text-[9px] tracking-[0.2em] uppercase font-bold text-luxury-dark flex items-center gap-1.5">
            <span className="text-amber-500 text-[10px]">✦</span> NEW
          </div>
        )}
        
        {/* الصورة الأولى */}
        <motion.div
          animate={{ opacity: hovered ? 0 : 1, scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={image1}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={false} // لو أول 3 منتجات، خليها true عشان التحميل السريع
          />
        </motion.div>

        {/* الصورة الثانية (تظهر عند الهوفر) */}
        {image2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={image2}
              alt={`${title} - alternate view`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </motion.div>
        )}

        {/* زر الإضافة السريعة */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: hovered ? 0 : 20, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={(e) => { e.stopPropagation(); addToCart({ id, title, collection, price, image1 }); }}
          className="absolute bottom-6 left-6 right-6 bg-luxury-dark/90 backdrop-blur-md text-white text-[10px] tracking-[0.3em] uppercase py-3 border border-white/10 hover:bg-white hover:text-luxury-dark transition-colors duration-300 z-20 font-light"
        >
          Quick Add
        </motion.button>
      </div>

      {/* النصوص أسفل البطاقة */}
      <div className="mt-6 flex flex-col items-center text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase text-luxury-gold mb-1 font-light">{collection}</p>
        <h3 className="text-sm tracking-[0.15em] uppercase text-luxury-dark font-light transition-colors group-hover:text-luxury-gold duration-300">{title}</h3>
        <div className="w-6 h-[1px] bg-neutral-200 my-2 transition-all group-hover:w-12 duration-500" />
        <p className="text-xs tracking-[0.2em] text-luxury-gray font-light">
          {displayPrice} ج.م
        </p>
      </div>
    </div>
  );
}