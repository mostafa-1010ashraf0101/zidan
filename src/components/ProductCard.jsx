"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ id, title, collection, price, image1, image2, isNew, sizes = [] }) {
  const { addToCart, setCartOpen } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [hovered, setHovered] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    // إذا كان هناك مقاسات متوفرة ولم يتم اختيار مقاس بعد
    if (sizes && sizes.length > 0 && !selectedSize) {
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 3000); // إخفاء التحذير بعد 3 ثواني
      return;
    }

    setErrorMessage(false);

    // إضافة المنتج للمصروفة بالمقاس المختار
    addToCart({
      id,
      title,
      collection,
      price,
      image: image1,
      selectedSize: selectedSize || (sizes[0] || 'FREE SIZE'),
      quantity: 1
    });

    // فتح السلة فوراً
    setCartOpen(true);
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

        {/* خيارات تحديد المقاسات الفاخرة فوق الصورة */}
        {sizes && sizes.length > 0 && (
          <div className="absolute bottom-0 inset-x-0 p-3 bg-white/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1.5 z-10">
            <span className="text-[8px] tracking-[0.2em] text-luxury-gray uppercase">Select Size</span>
            <div className="flex justify-center items-center gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedSize(size);
                    setErrorMessage(false);
                  }}
                  className={`text-[9px] tracking-wider w-7 h-7 flex items-center justify-center transition ${
                    selectedSize === size
                      ? 'bg-luxury-dark text-white font-bold'
                      : 'border border-neutral-300 text-luxury-dark hover:border-luxury-dark'
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

        {/* رسالة خطأ في حال عدم اختيار المقاس */}
        {errorMessage && (
          <span className="text-[9px] tracking-widest text-rose-700 uppercase mb-2 animate-bounce">
            Please Select a Size Above
          </span>
        )}

        {/* زر الإضافة للسلة */}
        <button
          onClick={handleAddToCart}
          className={`w-full mt-auto py-3 border text-[9px] tracking-[0.3em] uppercase transition-all duration-300 font-light ${
            selectedSize 
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
