'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Collect all images from the project
const ALL_IMAGES = [
  // Day images
  '/images/day1.jpg',
  '/images/day2.jpg',
  '/images/day3.jpg',
  '/images/day4.jpeg',
  '/images/day5.jpeg',
  '/images/day16.jpeg',
  
  // Memory images (original set)
  '/images/memory/1.jpeg',
  '/images/memory/2.jpeg',
  '/images/memory/3.jpeg',
  '/images/memory/4.JPG',
  '/images/memory/5.jpeg',
  '/images/memory/6.jpeg',
  
  // Memory images (new set)
  '/images/memory/new/1.JPG',
  '/images/memory/new/2.JPG',
  '/images/memory/new/3.jpg',
  '/images/memory/new/4.jpg',
  '/images/memory/new/5.jpg',
  '/images/memory/new/6.jpeg',
  
  // Sudoku images
  '/images/sudoku/1.JPG',
  '/images/sudoku/2.JPG',
  '/images/sudoku/3.JPG',
  '/images/sudoku/4.JPG',
  '/images/sudoku/5.JPG',
  
  // Other images
  '/images/puzzle.JPG',
  '/images/apple.png',
  '/images/snake.png',
  '/images/chef.png',
  '/images/date.png',
  
  // Additional photos
  '/images/16C0DA30-D094-482A-9D48-673BE149CAE6_1_105_c.jpeg',
  '/images/24B4F419-A543-4DEA-83AB-8B51E8003E1D_4_5005_c.jpeg',
  '/images/3194827C-6018-4A05-9D59-77C1D4FF91B5_4_5005_c.jpeg',
  '/images/3C8067DE-1C03-4E39-BE63-1DF5E1EF635D_4_5005_c.jpeg',
  '/images/407A0936-F786-41A2-9E4B-F74A812E268D_4_5005_c.jpeg',
  '/images/42B209D5-8BBA-41E3-A573-E30B031188D3_4_5005_c.jpeg',
  '/images/4AFAA829-3AC3-4841-ACEA-B57406349614_4_5005_c.jpeg',
  '/images/73E6214A-0EBC-40DE-B649-1A2F8DDDF6DB_4_5005_c.jpeg',
  '/images/881FED54-6C39-4EC8-88FC-1FBC926D2ABB_4_5005_c.jpeg',
  '/images/9450CF98-3D15-46E0-A74F-E5C63C80AD7F_4_5005_c.jpeg',
  '/images/BFA2B284-4982-4F8D-B4FE-773CD71AF021_1_105_c.jpeg',
  '/images/CF44CB95-3B7A-4C22-8C73-B7698B180B4A_1_105_c.jpeg',
  '/images/D88E278A-C9A1-4419-964F-43DD926255BB_4_5005_c.jpeg',
  '/images/E416E597-5933-48E5-8C9D-1D980C384609_4_5005_c.jpeg',
  '/images/FEB7B557-EB8F-40B8-BEA9-F17C18FA9333_4_5005_c.jpeg',
  '/images/FEE951B9-68B0-42E6-A779-87DB81EF8BB3_1_105_c.jpeg',
];

const SLIDE_DURATION = 4000; // 4 seconds per image
const INTRO_DURATION = 5000; // 5 seconds for intro

// Different animation variants for variety
const getAnimationVariant = (index: number) => {
  const variants = [
    // Fade and zoom
    {
      enter: { opacity: 0, scale: 0.5, rotate: -10 },
      center: { opacity: 1, scale: 1, rotate: 0 },
      exit: { opacity: 0, scale: 1.5, rotate: 10 },
    },
    // Slide from right with rotation
    {
      enter: { x: 500, opacity: 0, rotateY: 90 },
      center: { x: 0, opacity: 1, rotateY: 0 },
      exit: { x: -500, opacity: 0, rotateY: -90 },
    },
    // Slide from left with flip
    {
      enter: { x: -500, opacity: 0, rotateY: -90 },
      center: { x: 0, opacity: 1, rotateY: 0 },
      exit: { x: 500, opacity: 0, rotateY: 90 },
    },
    // Zoom and fade from center
    {
      enter: { scale: 0, opacity: 0, y: 100 },
      center: { scale: 1, opacity: 1, y: 0 },
      exit: { scale: 0.5, opacity: 0, y: -100 },
    },
    // Rotate and scale
    {
      enter: { rotate: 180, scale: 0.3, opacity: 0 },
      center: { rotate: 0, scale: 1, opacity: 1 },
      exit: { rotate: -180, scale: 0.3, opacity: 0 },
    },
    // Slide up with bounce
    {
      enter: { y: 300, opacity: 0, scale: 0.8 },
      center: { y: 0, opacity: 1, scale: 1 },
      exit: { y: -300, opacity: 0, scale: 0.8 },
    },
    // Flip card
    {
      enter: { rotateX: 90, opacity: 0 },
      center: { rotateX: 0, opacity: 1 },
      exit: { rotateX: -90, opacity: 0 },
    },
    // Spiral
    {
      enter: { rotate: 360, scale: 0, opacity: 0, x: 200, y: 200 },
      center: { rotate: 0, scale: 1, opacity: 1, x: 0, y: 0 },
      exit: { rotate: -360, scale: 0, opacity: 0, x: -200, y: -200 },
    },
  ];
  return variants[index % variants.length];
};

export default function RecapPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [validImages, setValidImages] = useState<string[]>(ALL_IMAGES);

  // Hide intro after duration
  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, INTRO_DURATION);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // Auto-advance slideshow
  useEffect(() => {
    if (!isPlaying || showIntro) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isPlaying, showIntro, validImages.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const skipIntro = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-warm-beige to-blush-pink/30 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {typeof window !== 'undefined' && [...Array(30)].map((_, i) => {
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            return (
              <motion.div
                key={i}
                className="absolute text-christmas-red/30"
                initial={{
                  x: `${startX}%`,
                  y: `${startY}%`,
                  scale: Math.random() * 0.5 + 0.3,
                }}
                animate={{
                  y: `${(startY + Math.random() * 50) % 100}%`,
                  x: `${(startX + Math.random() * 50) % 100}%`,
                  rotate: [0, 360],
                  scale: [null, Math.random() * 0.5 + 0.5, Math.random() * 0.3 + 0.3],
                }}
                transition={{
                  duration: Math.random() * 8 + 6,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Sparkles size={20} />
              </motion.div>
            );
          })}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <motion.h1
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-christmas-red via-blush-pink to-soft-gold bg-clip-text text-transparent"
              >
                Frohe Weihnachten
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-xl sm:text-2xl md:text-3xl text-gray-700 mb-8"
            >
              Hier ein kleiner Recap durch den Advent
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                delay: 1.5,
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              }}
              className="inline-block mb-8"
            >
              <Heart className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-christmas-red fill-christmas-red" />
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={skipIntro}
              className="bg-christmas-red text-white px-8 py-4 rounded-full font-semibold text-lg sm:text-xl shadow-lg hover:bg-soft-red transition-colors touch-manipulation"
            >
              Los geht's →
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentVariant = getAnimationVariant(currentIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-beige to-blush-pink/30 flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {typeof window !== 'undefined' && [...Array(15)].map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          return (
            <motion.div
              key={i}
              className="absolute text-christmas-red/15"
              initial={{
                x: `${startX}%`,
                y: `${startY}%`,
                scale: Math.random() * 0.5 + 0.3,
              }}
              animate={{
                y: `${(startY + Math.random() * 50) % 100}%`,
                x: `${(startX + Math.random() * 50) % 100}%`,
                rotate: [0, 360],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Sparkles size={20} />
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-2 sm:px-0">
          <Link
            href="/"
            className="flex items-center gap-1 sm:gap-2 text-christmas-red active:text-soft-red transition-colors touch-manipulation min-h-[44px] min-w-[44px] justify-center"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold hidden xs:inline">Zurück</span>
          </Link>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-center"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-christmas-red via-blush-pink to-soft-gold bg-clip-text text-transparent">
              Unsere Reise
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs sm:text-sm text-gray-600 mt-1"
            >
              {currentIndex + 1} / {validImages.length}
            </motion.p>
          </motion.div>
          <div className="w-20 sm:w-24" /> {/* Spacer for centering */}
        </div>

        {/* Main Image Display - Bigger and mobile optimized */}
        <div className="relative w-full mb-4 sm:mb-6 rounded-2xl overflow-hidden shadow-2xl bg-black/10" style={{ minHeight: '50vh', maxHeight: '85vh' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={currentVariant}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                y: { type: 'spring', stiffness: 300, damping: 30 },
                scale: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 },
                rotate: { type: 'spring', stiffness: 200, damping: 20 },
                rotateX: { type: 'spring', stiffness: 200, damping: 20 },
                rotateY: { type: 'spring', stiffness: 200, damping: 20 },
              }}
              className="absolute inset-0"
            >
              <img
                src={validImages[currentIndex]}
                alt={`Memory ${currentIndex + 1}`}
                className="w-full h-full object-contain"
                style={{ 
                  maxHeight: '85vh',
                  width: '100%',
                  height: 'auto',
                }}
                onLoad={() => {
                  // Image loaded successfully
                }}
                onError={(e) => {
                  // Remove broken image from list
                  setValidImages(prev => {
                    const filtered = prev.filter(img => img !== validImages[currentIndex]);
                    if (currentIndex >= filtered.length) {
                      setCurrentIndex(0);
                    }
                    return filtered;
                  });
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows - Mobile optimized */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-christmas-red rounded-full p-2 sm:p-3 shadow-lg transition-all hover:scale-110 active:scale-95 touch-manipulation z-20 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-christmas-red rounded-full p-2 sm:p-3 shadow-lg transition-all hover:scale-110 active:scale-95 touch-manipulation z-20 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Next image"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white/90 hover:bg-white text-christmas-red rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg transition-all hover:scale-105 active:scale-95 font-semibold touch-manipulation text-sm sm:text-base min-h-[44px]"
          >
            {isPlaying ? 'Pause' : 'Weiter'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/30 rounded-full h-1.5 sm:h-2 mb-6 sm:mb-8 overflow-hidden max-w-2xl mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-christmas-red via-blush-pink to-soft-gold"
            initial={{ width: 0 }}
            animate={{ width: isPlaying ? '100%' : '0%' }}
            transition={{
              duration: SLIDE_DURATION / 1000,
              repeat: isPlaying ? Infinity : 0,
              ease: 'linear',
            }}
          />
        </div>

        {/* Final Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center px-4 pb-4 sm:pb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-block mb-3 sm:mb-4"
          >
            <Heart className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-christmas-red fill-christmas-red" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-christmas-red mb-3 sm:mb-4">
            Frohe Weihnachten, mein Schatz! 🎄
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Diese Reise durch den Advent war so besonders, weil ich sie mit dir erleben durfte. 
            Du bist das Beste, was mir je passiert ist. Ich liebe dich über alles. ❤️✨
          </p>
        </motion.div>
      </div>
    </div>
  );
}
