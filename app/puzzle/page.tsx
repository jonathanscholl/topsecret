'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { JigsawPuzzle } from 'react-jigsaw-puzzle/lib';
import 'react-jigsaw-puzzle/lib/jigsaw-puzzle.css';

const PUZZLE_IMAGE = '/images/puzzle.JPG'; // You can change this image later
const ROWS = 5;
const COLUMNS = 5;
const TOTAL_PIECES = ROWS * COLUMNS;

export default function PuzzlePage() {
  const [isSolved, setIsSolved] = useState(false);
  const [key, setKey] = useState(0); // For resetting the puzzle
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [containerReady, setContainerReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Preload the image to ensure it's available
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      // Small delay to ensure container is ready
      setTimeout(() => setContainerReady(true), 100);
    };
    img.onerror = () => {
      setError('Bild konnte nicht geladen werden');
    };
    img.src = PUZZLE_IMAGE;
  }, []);

  const handleSolved = () => {
    setIsSolved(true);
  };

  const handleReset = () => {
    setIsSolved(false);
    setContainerReady(false);
    setKey(prev => prev + 1); // Force re-render to reset puzzle
    // Re-initialize after a brief delay
    setTimeout(() => {
      setContainerReady(true);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-beige to-blush-pink/30 flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 pt-4 sm:pt-8 pb-4 sm:pb-8 overflow-x-hidden">
      <div className="max-w-7xl w-full overflow-x-hidden">
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
            Puzzle
          </h1>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 sm:gap-2 text-christmas-red active:text-soft-red transition-colors touch-manipulation min-h-[44px] min-w-[44px] justify-center"
          >
            <RotateCw size={20} className="sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold hidden sm:inline">Neu</span>
          </button>
        </div>

        {/* Game State Message */}
        <AnimatePresence>
          {isSolved && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mb-4 sm:mb-6 px-2"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-forest-green mb-2">
                🎉 Puzzle gelöst! 🎉
              </h2>
              <p className="text-base sm:text-lg text-gray-700">
                Du hast alle {TOTAL_PIECES} Teile platziert!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {!isSolved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 sm:mb-6 text-center px-2"
          >
            <p className="text-sm sm:text-base text-gray-600">
              Ziehe die Puzzle-Teile an die richtige Position! 🧩
            </p>
          </motion.div>
        )}

        {/* Puzzle Container */}
        <div className="px-2 sm:px-0 w-full overflow-x-hidden">
          {error ? (
            <div className="text-center py-8 px-4">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setImageLoaded(false);
                  const img = new Image();
                  img.onload = () => setImageLoaded(true);
                  img.onerror = () => setError('Bild konnte nicht geladen werden');
                  img.src = PUZZLE_IMAGE;
                }}
                className="px-4 py-2 bg-christmas-red text-white rounded-lg"
              >
                Erneut versuchen
              </button>
            </div>
          ) : (
            <div 
              key={key}
              className="jigsaw-puzzle-wrapper"
            >
              {!isMounted || !imageLoaded || !containerReady ? (
                <div className="flex items-center justify-center min-h-[400px] w-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-christmas-red mx-auto mb-4"></div>
                    <p className="text-gray-600">Puzzle wird geladen...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full flex justify-center" style={{ minHeight: '400px' }}>
                  <JigsawPuzzle
                    imageSrc={PUZZLE_IMAGE}
                    rows={ROWS}
                    columns={COLUMNS}
                    onSolved={handleSolved}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
