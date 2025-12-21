'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCw, Heart } from 'lucide-react';
import Link from 'next/link';

const BACKGROUND_IMAGE = '/images/whereiswaldo/image.png';
const APPLE_IMAGE = '/images/apple.png';
const SNAKE_IMAGE = '/images/snake.png';

// Click tolerance in pixels (how close you need to click)
const CLICK_TOLERANCE = 35;

// Generate random head positions (as percentage of image dimensions)
// x is percentage from left edge, y is percentage from top edge
// Keep positions away from edges (10-90% range) to ensure they're visible
const generateRandomPositions = () => {
  const minPos = 15; // Minimum position from edges (15%)
  const maxPos = 85; // Maximum position from edges (85%)
  
  let applePos, snakePos;
  let attempts = 0;
  
  // Ensure heads are not too close to each other (at least 25% apart)
  do {
    applePos = {
      x: minPos + Math.random() * (maxPos - minPos),
      y: minPos + Math.random() * (maxPos - minPos),
    };
    snakePos = {
      x: minPos + Math.random() * (maxPos - minPos),
      y: minPos + Math.random() * (maxPos - minPos),
    };
    attempts++;
    
    // Check distance between heads
    const distance = Math.sqrt(
      Math.pow(applePos.x - snakePos.x, 2) + Math.pow(applePos.y - snakePos.y, 2)
    );
    
    if (distance >= 25 || attempts > 50) break; // At least 25% apart or give up after 50 attempts
  } while (attempts <= 50);
  
  return { apple: applePos, snake: snakePos };
};

export default function WhereIsWaldoPage() {
  const [headPercentages, setHeadPercentages] = useState(() => generateRandomPositions());
  const [appleFound, setAppleFound] = useState(false);
  const [snakeFound, setSnakeFound] = useState(false);
  const [isKissing, setIsKissing] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [headPositions, setHeadPositions] = useState<{
    apple: { x: number; y: number };
    snake: { x: number; y: number };
  } | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate actual pixel positions when image loads
  useEffect(() => {
    const updatePositions = () => {
      if (imageRef.current && containerRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        setImageSize({ width, height });
        setHeadPositions({
          apple: {
            x: (headPercentages.apple.x / 100) * width,
            y: (headPercentages.apple.y / 100) * height,
          },
          snake: {
            x: (headPercentages.snake.x / 100) * width,
            y: (headPercentages.snake.y / 100) * height,
          },
        });
      }
    };

    if (imageRef.current) {
      imageRef.current.addEventListener('load', updatePositions);
      updatePositions();
    }

    window.addEventListener('resize', updatePositions);
    return () => {
      window.removeEventListener('resize', updatePositions);
      if (imageRef.current) {
        imageRef.current.removeEventListener('load', updatePositions);
      }
    };
  }, [headPercentages]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !headPositions || gameComplete || isKissing) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundApple = appleFound;
    let foundSnake = snakeFound;

    // Check if click is near apple position
    if (!appleFound) {
      const appleDistance = Math.sqrt(
        Math.pow(x - headPositions.apple.x, 2) + Math.pow(y - headPositions.apple.y, 2)
      );
      if (appleDistance <= CLICK_TOLERANCE) {
        foundApple = true;
        setAppleFound(true);
      }
    }

    // Check if click is near snake position
    if (!snakeFound) {
      const snakeDistance = Math.sqrt(
        Math.pow(x - headPositions.snake.x, 2) + Math.pow(y - headPositions.snake.y, 2)
      );
      if (snakeDistance <= CLICK_TOLERANCE) {
        foundSnake = true;
        setSnakeFound(true);
      }
    }

    // Check if both are found after this click
    if (foundApple && foundSnake) {
      setTimeout(() => {
        setIsKissing(true);
        setTimeout(() => {
          setGameComplete(true);
        }, 2000);
      }, 500);
    }
  };

  const resetGame = () => {
    setIsResetting(true);
    setAppleFound(false);
    setSnakeFound(false);
    setIsKissing(false);
    setGameComplete(false);
    
    // Hide heads, generate new positions, then show them after a brief delay
    setTimeout(() => {
      setHeadPercentages(generateRandomPositions());
      // Small delay to ensure positions are updated before showing
      setTimeout(() => {
        setIsResetting(false);
      }, 100);
    }, 200);
  };

  // Calculate center point for kiss animation
  const kissCenter = headPositions ? {
    x: (headPositions.apple.x + headPositions.snake.x) / 2,
    y: (headPositions.apple.y + headPositions.snake.y) / 2,
  } : { x: 0, y: 0 };

  const appleFinalX = headPositions ? kissCenter.x - 40 : 0;
  const appleFinalY = headPositions ? kissCenter.y : 0;
  const snakeFinalX = headPositions ? kissCenter.x + 40 : 0;
  const snakeFinalY = headPositions ? kissCenter.y : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-beige to-blush-pink/30 flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 pt-4 sm:pt-8 pb-4 sm:pb-8">
      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-6 px-2 sm:px-0">
          <Link
            href="/"
            className="flex items-center gap-1 sm:gap-2 text-christmas-red active:text-soft-red transition-colors touch-manipulation min-h-[44px] min-w-[44px] justify-center"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold hidden xs:inline">Zurück</span>
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-christmas-red via-blush-pink to-soft-gold bg-clip-text text-transparent">
            Finde uns!
          </h1>
          <button
            onClick={resetGame}
            className="flex items-center gap-1 sm:gap-2 text-christmas-red active:text-soft-red transition-colors touch-manipulation min-h-[44px] min-w-[44px] justify-center"
          >
            <RotateCw size={20} className="sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold hidden sm:inline">Neu</span>
          </button>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-4 sm:gap-6 mb-4 sm:mb-6 px-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-md">
            <div className="text-xs sm:text-sm text-gray-600">Gefunden</div>
            <div className="text-lg sm:text-2xl font-bold text-christmas-red">
              {(appleFound ? 1 : 0) + (snakeFound ? 1 : 0)}/2
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!gameComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 sm:mb-6 text-center px-2"
          >
            <p className="text-sm sm:text-base text-gray-600">
              Finde unsere beiden Köpfe im Bild! Klicke auf sie, wenn du sie findest. 💕
            </p>
          </motion.div>
        )}

        {/* Game Complete Message */}
        <AnimatePresence>
          {gameComplete && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mb-4 sm:mb-6 px-2"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-forest-green mb-2">
                🎉 Du hast es geschafft! 🎉
              </h2>
              <p className="text-base sm:text-lg text-gray-700">
                Du hast uns beide gefunden! 💕
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Container */}
        <div
          ref={containerRef}
          className="relative w-full flex justify-center px-2 sm:px-0 cursor-crosshair overflow-hidden"
          onClick={handleImageClick}
        >
          <div className="relative w-full max-w-full">
            <div className="relative overflow-hidden rounded-lg shadow-2xl bg-gray-100 w-full" style={{ height: '70vh', minHeight: '400px' }}>
              <img
                ref={imageRef}
                src={BACKGROUND_IMAGE}
                alt="Where's Waldo scene"
                className="w-full h-full select-none object-cover"
                style={{ 
                  display: 'block'
                }}
                draggable={false}
              />

            {/* Apple Head */}
            {headPositions && !isResetting && (
              <motion.div
                initial={!appleFound && !isKissing ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                animate={
                  isKissing
                    ? {
                        x: appleFinalX - headPositions.apple.x,
                        y: appleFinalY - headPositions.apple.y,
                        scale: 1.2,
                        rotate: -10,
                      }
                    : {
                        opacity: 1,
                        scale: appleFound ? 1 : 1,
                      }
                }
                transition={
                  isKissing
                    ? { duration: 1, ease: 'easeInOut' }
                    : { duration: 0.3, type: 'spring' }
                }
                className="absolute pointer-events-none"
                style={{
                  left: headPositions.apple.x,
                  top: headPositions.apple.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className={`rounded-full p-1 sm:p-1.5 ${
                    appleFound 
                      ? 'bg-green-400/90 border-2 sm:border-3 border-white shadow-2xl' 
                      : ''
                  }`}
                >
                  <img
                    src={APPLE_IMAGE}
                    alt="Apple head"
                    className="w-6 h-6 sm:w-10 sm:h-10 object-contain drop-shadow-lg"
                    draggable={false}
                  />
                </div>
              </motion.div>
            )}

            {/* Snake Head */}
            {headPositions && !isResetting && (
              <motion.div
                initial={!snakeFound && !isKissing ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                animate={
                  isKissing
                    ? {
                        x: snakeFinalX - headPositions.snake.x,
                        y: snakeFinalY - headPositions.snake.y,
                        scale: 1.2,
                        rotate: 10,
                      }
                    : {
                        opacity: 1,
                        scale: snakeFound ? 1 : 1,
                      }
                }
                transition={
                  isKissing
                    ? { duration: 1, ease: 'easeInOut' }
                    : { duration: 0.3, type: 'spring' }
                }
                className="absolute pointer-events-none"
                style={{
                  left: headPositions.snake.x,
                  top: headPositions.snake.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className={`rounded-full p-1 sm:p-1.5 ${
                    snakeFound 
                      ? 'bg-green-400/90 border-2 sm:border-3 border-white shadow-2xl' 
                      : ''
                  }`}
                >
                  <img
                    src={SNAKE_IMAGE}
                    alt="Snake head"
                    className="w-6 h-6 sm:w-10 sm:h-10 object-contain drop-shadow-lg"
                    draggable={false}
                  />
                </div>
              </motion.div>
            )}

            {/* Kiss Effect */}
            {isKissing && headPositions && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [1, 1.3, 1] }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute pointer-events-none"
                style={{
                  left: kissCenter.x,
                  top: kissCenter.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Heart
                  className="w-12 h-12 sm:w-16 sm:h-16 text-christmas-red fill-christmas-red"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.8))' }}
                />
              </motion.div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

