"use client";
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    // قللنا إجمالي وقت الشاشة لـ 4 ثوانٍ فقط عشان الإيقاع يكون أسرع
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(12px)', transition: { duration: 0.9, ease: 'easeInOut' } }}
      className="fixed inset-0 bg-luxury-dark z-50 flex items-center justify-center overflow-hidden select-none px-4"
    >
      {/* الحاوية الرئيسية - الفضي اللامع الموحد */}
      <div className="relative flex items-center justify-center font-serif text-neutral-300 h-32 w-full max-w-2xl">
        
        {/* حرف Z: بيبدأ متداخل في السنتر، وبعد 1.2 ثانية فقط يبدأ يفتح للشمال */}
        <motion.span
          initial={{ opacity: 0, x: "15px", left: "50%" }}
          animate={{ 
            opacity: [0, 1, 1, 1],
            x: ["15px", "15px", "15px", "0%"],
            left: ["50%", "50%", "50%", "0%"]
          }}
          transition={{ 
            duration: 2.5, // قللنا وقت الحركة الإجمالي
            times: [0, 0.2, 0.5, 1], // التباعد بيبدأ أسرع عند الـ 50%
            ease: [0.25, 1, 0.5, 1]
          }}
          className="absolute text-7xl md:text-9xl font-light tracking-widest drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)] bg-gradient-to-b from-neutral-100 via-neutral-300 to-neutral-500 bg-clip-text text-transparent"
          style={{ transform: "translateX(-50%)" }}
        >
          Z
        </motion.span>

        {/* الحروف الداخلية (I D A): بتظهر فجأة بشكل أسرع وأوضح */}
        <motion.span 
          initial={{ opacity: 0, filter: 'blur(6px)' }}
          animate={{ opacity: [0, 0, 1], filter: ["blur(6px)", "blur(6px)", "blur(0px)"] }}
          transition={{ duration: 2.5, times: [0, 0.55, 1], ease: 'easeInOut' }}
          className="flex text-4xl md:text-7xl font-extralight uppercase tracking-[0.6em] z-10 mx-auto justify-center pl-[0.6em] bg-gradient-to-b from-neutral-100 via-neutral-300 to-neutral-500 bg-clip-text text-transparent"
        >
          <span>I</span>
          <span>D</span>
          <span>A</span>
        </motion.span>

        {/* حرف N: متداخل مع Z في السنتر ويفتح لليمين في نفس اللحظة بريق خاطف */}
        <motion.span
          initial={{ opacity: 0, x: "-15px", right: "50%" }}
          animate={{ 
            opacity: [0, 1, 1, 1],
            x: ["-15px", "-15px", "-15px", "0%"],
            right: ["50%", "50%", "50%", "0%"]
          }}
          transition={{ 
            duration: 2.5, 
            times: [0, 0.2, 0.5, 1],
            ease: [0.25, 1, 0.5, 1]
          }}
          className="absolute text-7xl md:text-9xl font-light tracking-widest drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)] bg-gradient-to-b from-neutral-100 via-neutral-300 to-neutral-500 bg-clip-text text-transparent"
          style={{ transform: "translateX(50%)" }}
        >
          N
        </motion.span>

        {/* الخط السفلي الديكوري الفضي بيظهر بشكل خاطف وسريع لإغلاق المشهد */}
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 0, 1], opacity: [0, 0, 0.25] }}
          transition={{ duration: 2.8, times: [0, 0.65, 1], ease: 'easeInOut' }}
          className="absolute -bottom-6 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-300 to-transparent"
        />
      </div>
    </motion.div>
  );
}