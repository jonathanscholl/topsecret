'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Image sets - original set for door 14, sudoku set for door 22
const IMAGE_SETS = {
  default: [
    '/images/memory/1.jpeg',
    '/images/memory/2.jpeg',
    '/images/memory/3.jpeg',
    '/images/memory/4.JPG',
    '/images/memory/5.jpeg',
    '/images/memory/6.jpeg',
  ],
  new: [
    '/images/memory/new/1.JPG',
    '/images/memory/new/2.JPG',
    '/images/memory/new/3.jpg',
    '/images/memory/new/4.jpg',
    '/images/memory/new/5.jpg',
    '/images/memory/new/6.jpeg',
  ],
};

interface Card {
  id: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function MemoryGame() {
  const searchParams = useSearchParams();
  const imageSet = searchParams.get('set') || 'default';
  const IMAGE_PAIRS = IMAGE_SETS[imageSet as keyof typeof IMAGE_SETS] || IMAGE_SETS.default;
  
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [isChecking, setIsChecking] = useState(false);

  // Initialize game
  const initializeGame = useCallback(() => {
    // Create pairs of cards
    const cardPairs: Card[] = [];
    IMAGE_PAIRS.forEach((image, index) => {
      // Add two cards for each image (pair)
      cardPairs.push(
        { id: index * 2, image, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, image, isFlipped: false, isMatched: false }
      );
    });

    // Shuffle cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameState('playing');
    setIsChecking(false);
  }, [IMAGE_PAIRS]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle card click
  const handleCardClick = useCallback((index: number) => {
    if (isChecking) return;
    if (flippedCards.length >= 2) return;

    const card = cards[index];
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    // Update card to show it's flipped
    setCards(prevCards =>
      prevCards.map((c, i) =>
        i === index ? { ...c, isFlipped: true } : c
      )
    );

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);

      // Capture the card images before the timeout
      const [firstIndex, secondIndex] = newFlippedCards;
      const firstCardImage = cards[firstIndex].image;
      const secondCardImage = cards[secondIndex].image;

      setTimeout(() => {
        if (firstCardImage === secondCardImage) {
          // Match found!
          setCards(prevCards =>
            prevCards.map((c, i) =>
              i === firstIndex || i === secondIndex
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );
          setMatches(prev => {
            const newMatches = prev + 1;
            // Check if all pairs are matched
            if (newMatches === IMAGE_PAIRS.length) {
              setGameState('won');
            }
            return newMatches;
          });
        } else {
          // No match - flip cards back
          setCards(prevCards =>
            prevCards.map((c, i) =>
              i === firstIndex || i === secondIndex
                ? { ...c, isFlipped: false }
                : c
            )
          );
        }

        setFlippedCards([]);
        setIsChecking(false);
      }, 1000);
    }
  }, [cards, flippedCards, isChecking]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-beige to-blush-pink/30 flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 pt-4 sm:pt-8 pb-4 sm:pb-8">
      <div className="max-w-4xl w-full">
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
            Memory
          </h1>
          <button
            onClick={initializeGame}
            className="flex items-center gap-1 sm:gap-2 text-christmas-red active:text-soft-red transition-colors touch-manipulation min-h-[44px] min-w-[44px] justify-center"
          >
            <RotateCw size={20} className="sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold hidden sm:inline">Neu</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-4 sm:gap-6 mb-4 sm:mb-6 px-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-md">
            <div className="text-xs sm:text-sm text-gray-600">Züge</div>
            <div className="text-lg sm:text-2xl font-bold text-christmas-red">{moves}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-md">
            <div className="text-xs sm:text-sm text-gray-600">Gefunden</div>
            <div className="text-lg sm:text-2xl font-bold text-forest-green">{matches}/{IMAGE_PAIRS.length}</div>
          </div>
        </div>

        {/* Game State Message */}
        <AnimatePresence>
          {gameState === 'won' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mb-4 sm:mb-6 px-2"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-forest-green mb-2">
                🎉 Gewonnen! 🎉
              </h2>
              <p className="text-base sm:text-lg text-gray-700">
                Du hast alle Paare gefunden in {moves} Zügen!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 px-2 sm:px-0">
          {cards.map((card, index) => {
            const isFlipped = card.isFlipped || card.isMatched;
            const isInFlippedPair = flippedCards.includes(index);

            return (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(index)}
                disabled={isFlipped || isChecking || gameState === 'won'}
                className={`
                  aspect-square relative rounded-lg sm:rounded-xl overflow-hidden
                  touch-manipulation select-none
                  ${card.isMatched ? 'opacity-75' : ''}
                  ${isFlipped ? '' : 'bg-white/90 hover:bg-white shadow-lg active:scale-95'}
                  ${!isFlipped && !isChecking && gameState === 'playing' ? 'cursor-pointer' : 'cursor-not-allowed'}
                  transition-all duration-200
                `}
                whileHover={!isFlipped && !isChecking && gameState === 'playing' ? { scale: 1.05 } : {}}
                whileTap={!isFlipped && !isChecking && gameState === 'playing' ? { scale: 0.95 } : {}}
                initial={false}
                animate={{
                  rotateY: isFlipped ? 0 : 180,
                }}
                transition={{ duration: 0.3 }}
              >
                {isFlipped ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full relative"
                  >
                    <img
                      src={card.image}
                      alt={`Memory card ${card.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide image if it fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {card.isMatched && (
                      <div className="absolute inset-0 bg-forest-green/20 flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-3xl sm:text-4xl"
                        >
                          ✓
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-christmas-red/20 to-blush-pink/20"
                    animate={{ rotateY: 180 }}
                    transition={{ duration: 0 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-3xl sm:text-4xl md:text-5xl"
                    >
                      ❓
                    </motion.div>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Instructions */}
        {gameState === 'playing' && matches === 0 && moves === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 sm:mt-6 text-center px-2"
          >
            <p className="text-sm sm:text-base text-gray-600">
              Finde alle Paare! Tippe auf die Karten, um sie umzudrehen.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function MemoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cream via-warm-beige to-blush-pink/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-christmas-red mx-auto mb-4"></div>
          <p className="text-gray-600">Wird geladen...</p>
        </div>
      </div>
    }>
      <MemoryGame />
    </Suspense>
  );
}

