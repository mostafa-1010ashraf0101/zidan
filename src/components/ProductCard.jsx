"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ id, title, collection, price, image1, image2, isNew, sizes = [] }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [hovered, setHovered] = useState(false);
  const [showSizeWarning, setShowSizeWarning] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // ⛔ شرط إجباري: رفض الإضافة فوراً وبدون أي قيم افتراضية إذا لم يتم اختيار مقاس
    if (sizes && sizes.length > 0 && !selectedSize) {
      setShowSizeWarning(true);
      setHovered(true); // إظهار شريط المقاسات فوراً على الجوال والديسكتوب
      
      setTimeout(() => {
        setShowSizeWarning(false);
      }, 3000);
      return; // إيقاف العملية بالكامل
    }

    // الإضافة تتم فقط بعد إدخال المقاس المختار من المشتري
    addToCart({
      id,
      title,
      collection,
      price,
      image: image1,
      selectedSize: selectedSize, 
      quantity: 1
    });

    // تصفير الاختيار بعد الإضافة
    setSelectedSize('');
    setHovered(false);
    setShowSizeWarning(false);
  };

  return (
    <div 
      className="group relative flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* صورة المنتج */}
      <Link href={`/product/${id}`} className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 mb-4 block">
        {isNew && (
          <span className="absolute top-3 left-3 z-10 text-[8px] tracking-[0.3em] uppercase bg-luxury-dark text-white px-2 py-1 font-sans">
            New
          </span>
        )}

        <Image
          src={hovered && image2 ? image2 : image1 || '/placeholder.jpg'}
          alt={title || 'Product'}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* شريط اختيار المقاسات الإجباري */}
        {sizes && sizes.length > 0 && (
          <div 
            className={`absolute bottom-0 inset-x-0 p-3 bg-white/95 backdrop-blur-md transition-all duration-300 flex flex-col items-center gap-1.5 z-20 ${
              hovered || showSizeWarning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <span className={`text-[8px] tracking-[0.2em] uppercase transition ${
              showSizeWarning ? 'text-rose-600 font-bold animate-pulse' : 'text-luxury-gray'
            }`}>
              {showSizeWarning ? '⚠ SELECT A SIZE FIRST' : 'Select Size'}
            </span>

            <div className="flex justify-center items-center gap-2 flex-wrap">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                    setShowSizeWarning(false);
                  }}
                  className={`text-[9px] tracking-wider w-8 h-8 flex items-center justify-center transition ${
                    selectedSize === size
                      ? 'bg-luxury-dark text-white font-bold border border-luxury-dark'
                      : 'border border-neutral-300 text-luxury-dark hover:border-luxury-dark bg-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </Link>

      {/* تفاصيل المنتج */}
      <div className="flex flex-col items-center text-center flex-1">
        <span className="text-[9px] tracking-[0.3em] uppercase text-luxury-gold mb-1">
          {collection}
        </span>
        <Link href={`/product/${id}`}>
          <h3 className="text-xs tracking-[0.2em] uppercase text-luxury-dark font-light hover:text-luxury-gold transition mb-1">
            {title}
          </h3>
        </Link>
        <span className="text-xs tracking-widest text-luxury-gray font-light mb-4">
          {typeof price === 'number' ? `${price.toLocaleString()} ج.م` : price}
        </span>

        {/* زر الإضافة للسلة */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full mt-auto py-3 border text-[9px] tracking-[0.3em] uppercase transition-all duration-300 font-light ${
            showSizeWarning
              ? 'border-rose-600 text-rose-600 bg-rose-50'
              : selectedSize 
              ? 'border-luxury-dark bg-luxury-dark text-white hover:bg-transparent hover:text-luxury-dark' 
              : 'border-luxury-dark text-luxury-dark hover:bg-luxury-dark hover:text-white'
          }`}
        >
          {selectedSize ? `Add to Bag (${selectedSize})` : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
}
