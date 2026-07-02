"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// نفس داتا المنتجات لكن العملة بقت ج.م
const mockProducts = [
  { id: "wool-overcoat", title: "The Wool Atelier Overcoat", collection: "Ready-To-Wear", price: 1450, image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200" },
  { id: "calfskin-tote", title: "Signature Calfskin Tote", collection: "Leather Goods", price: 2100, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=200" },
  { id: "oud-perfume", title: "Oud Absolu de Parfum", collection: "High Perfumery", price: 320, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=200" }
];

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filteredProducts = mockProducts.filter(product => 
    product.title.toLowerCase().includes(query.toLowerCase()) ||
    product.collection.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-luxury-cream/98 backdrop-blur-md z-50 px-6 md:px-16 py-8 flex flex-col"
        >
          <div className="flex justify-between items-center max-w-4xl w-full mx-auto mb-16">
            <span className="text-[10px] tracking-[0.4em] uppercase text-luxury-gold font-light">Search Atelier</span>
            <button onClick={onClose} className="text-[10px] tracking-widest text-luxury-gray hover:text-luxury-dark uppercase transition">
              Close ✕
            </button>
          </div>

          <div className="max-w-4xl w-full mx-auto border-b border-neutral-300 pb-4">
            <input
              autoFocus
              type="text"
              placeholder="Type to discover..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xl md:text-3xl tracking-widest font-light text-luxury-dark placeholder-neutral-300 font-serif"
            />
          </div>

          <div className="max-w-4xl w-full mx-auto mt-12 flex-1 overflow-y-auto">
            {query.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        onClose();
                        router.push(`/product/${product.id}`);
                      }}
                      className="flex items-center gap-4 p-3 border border-neutral-200/40 bg-white/40 hover:bg-white cursor-pointer transition-all duration-300"
                    >
                      <div className="w-16 h-20 bg-cover bg-center border border-neutral-200/40" style={{ backgroundImage: `url(${product.image})` }} />
                      <div>
                        <span className="text-[8px] tracking-[0.3em] uppercase text-luxury-gold block mb-1">{product.collection}</span>
                        <h4 className="text-xs tracking-wide text-luxury-dark uppercase font-light">{product.title}</h4>
                        <span className="text-xs text-luxury-gray font-light mt-1 block">{product.price.toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs tracking-widest text-luxury-gray uppercase font-light italic lowercase">No impeccable matches found.</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}