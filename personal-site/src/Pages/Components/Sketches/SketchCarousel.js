import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import P5Wrapper from './SketchComponent';

const sketches = [
  {
    name: 'Floating Circles',
    component: 'circles',
    description: 'Interactive floating circles that respond to mouse movement',
    instructions: 'Click and drag your mouse to create floating circles'
  },
  {
    name: 'Hearts',
    component: 'Hearts',
    description: 'Dynamic heart patterns',
    instructions: 'Click anywhere to save the current pattern'
  },
];

const SketchCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const paginate = (newDirection) => {
    console.log('Paginating:', newDirection);
    
    const nextIndex = (currentIndex + newDirection + sketches.length) % sketches.length;
    setDirection(newDirection);
    setCurrentIndex(nextIndex);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'ArrowRight') paginate(1);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  return (
    <div className="flex justify-center w-full px-2 sm:px-4 py-4">
      <div className="w-full max-w-md bg-background rounded-xl shadow-xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute w-full h-full"
          >
            {/* Centered Sketch Container */}
            <div className="relative w-full h-full">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <P5Wrapper sketch={sketches[currentIndex].component} />
              </div>
              
              {/* Info Panel - Overlaid at bottom */}
              <div className="absolute bottom-0 w-full p-4 bg-white/90 rounded-t-lg">
                <h2 className="text-xl font-serif font-bold italic text-primary">
                  {sketches[currentIndex].name}
                </h2>
                <p className="text-sm text-text mt-1">
                  {sketches[currentIndex].instructions}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SketchCarousel; 