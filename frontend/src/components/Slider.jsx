import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1761110787206-2cc164e4913c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBldmVudCUyMHZlbnVlJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzc1Nzk5ODQ3fDA&ixlib=rb-4.1.0&q=85',
    title: 'Discover Perfect Venues',
    subtitle: 'AI-powered venue selection for your special events'
  },
  {
    image: 'https://images.unsplash.com/photo-1759519238029-689e99c6d19e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBldmVudCUyMHZlbnVlJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzc1Nzk5ODQ3fDA&ixlib=rb-4.1.0&q=85',
    title: 'Elegant Spaces',
    subtitle: 'Curated selection of premium venues'
  }
];

const Slider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[70vh] overflow-hidden" data-testid="hero-slider">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img 
            src={slides[current].image} 
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-heading text-5xl sm:text-6xl tracking-tight leading-none font-medium text-center mb-4"
              data-testid="slider-title"
            >
              {slides[current].title}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-stone-200 text-center"
              data-testid="slider-subtitle"
            >
              {slides[current].subtitle}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1 rounded-full transition-all ${
              idx === current ? 'w-12 bg-white' : 'w-6 bg-white/50'
            }`}
            data-testid={`slider-dot-${idx}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;