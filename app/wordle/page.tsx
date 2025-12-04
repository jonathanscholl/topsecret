'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCw } from 'lucide-react';
import Link from 'next/link';

const WORD = 'SKRIKI';
const MAX_GUESSES = 6;
const WORD_LENGTH = 6;

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

interface Cell {
  letter: string;
  state: LetterState;
}

export default function WordlePage() {
  const [guesses, setGuesses] = useState<Cell[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [usedLetters, setUsedLetters] = useState<Map<string, LetterState>>(new Map());
  const [shakeRow, setShakeRow] = useState<number>(-1);

  const checkGuess = useCallback((guess: string): Cell[] => {
    const cells: Cell[] = [];
    const wordArray = WORD.split('');
    const guessArray = guess.split('');
    const letterCounts = new Map<string, number>();

    // Count letters in the word
    wordArray.forEach(letter => {
      letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1);
    });

    // First pass: mark correct positions
    guessArray.forEach((letter, index) => {
      if (letter === wordArray[index]) {
        cells[index] = { letter, state: 'correct' };
        letterCounts.set(letter, (letterCounts.get(letter) || 0) - 1);
      } else {
        cells[index] = { letter, state: 'empty' };
      }
    });

    // Second pass: mark present letters
    guessArray.forEach((letter, index) => {
      if (cells[index].state === 'empty') {
        const count = letterCounts.get(letter) || 0;
        if (count > 0) {
          cells[index] = { letter, state: 'present' };
          letterCounts.set(letter, count - 1);
        } else {
          cells[index] = { letter, state: 'absent' };
        }
      }
    });

    return cells;
  }, []);

  const updateUsedLetters = useCallback((cells: Cell[]) => {
    const newUsedLetters = new Map(usedLetters);
    cells.forEach(cell => {
      const existing = newUsedLetters.get(cell.letter);
      if (!existing || existing === 'absent') {
        newUsedLetters.set(cell.letter, cell.state);
      } else if (existing === 'present' && cell.state === 'correct') {
        newUsedLetters.set(cell.letter, 'correct');
      }
    });
    setUsedLetters(newUsedLetters);
  }, [usedLetters]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing') return;

    if (key === 'ENTER') {
      if (currentGuess.length === WORD_LENGTH) {
        const guess = currentGuess;
        const newCells = checkGuess(guess);
        const newGuesses = [...guesses, newCells];
        setGuesses(newGuesses);
        updateUsedLetters(newCells);
        setCurrentGuess('');

        if (guess === WORD) {
          setGameState('won');
        } else if (newGuesses.length >= MAX_GUESSES) {
          setGameState('lost');
        }
      } else {
        // Shake animation for incomplete guess
        setShakeRow(guesses.length);
        setTimeout(() => setShakeRow(-1), 500);
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key.length === 1 && key.match(/[A-Za-z]/)) {
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess(prev => prev + key.toUpperCase());
      }
    }
  }, [currentGuess, gameState, guesses, checkGuess, updateUsedLetters]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default to avoid zoom on mobile when focusing inputs
      if (e.key === 'Enter' || e.key === 'Backspace' || e.key.match(/^[A-Za-z]$/)) {
        e.preventDefault();
      }
      
      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else if (e.key.match(/^[A-Za-z]$/)) {
        handleKeyPress(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const resetGame = () => {
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
    setUsedLetters(new Map());
    setShakeRow(-1);
  };

  const getCellColor = (state: LetterState): string => {
    switch (state) {
      case 'correct':
        return 'bg-forest-green text-white';
      case 'present':
        return 'bg-soft-gold text-white';
      case 'absent':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-white border-2 border-gray-300 text-gray-700';
    }
  };

  const getKeyColor = (letter: string): string => {
    const state = usedLetters.get(letter);
    switch (state) {
      case 'correct':
        return 'bg-forest-green text-white';
      case 'present':
        return 'bg-soft-gold text-white';
      case 'absent':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-warm-beige text-gray-700 hover:bg-gray-200';
    }
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-beige to-blush-pink/30 flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 pt-4 sm:pt-8 pb-4 sm:pb-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-4 px-2 sm:px-0">
          <Link
            href="/"
            className="flex items-center gap-1 sm:gap-2 text-christmas-red active:text-soft-red transition-colors touch-manipulation min-h-[44px] min-w-[44px] justify-center"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold hidden xs:inline">Zurück</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-christmas-red via-blush-pink to-soft-gold bg-clip-text text-transparent">
            Wordle
          </h1>
          <button
            onClick={resetGame}
            className="flex items-center gap-1 sm:gap-2 text-christmas-red active:text-soft-red transition-colors touch-manipulation min-h-[44px] min-w-[44px] justify-center"
          >
            <RotateCw size={20} className="sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold hidden sm:inline">Neu</span>
          </button>
        </div>

        {/* Game Grid */}
        <div className="flex flex-col gap-1.5 sm:gap-2 mb-4 sm:mb-8 px-1">
          {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
            const isCurrentRow = rowIndex === guesses.length;
            const rowCells = guesses[rowIndex] || [];
            const isShaking = shakeRow === rowIndex;

            return (
              <motion.div
                key={rowIndex}
                className="flex gap-1 sm:gap-2 justify-center"
                animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {Array.from({ length: WORD_LENGTH }).map((_, cellIndex) => {
                  const cell = rowCells[cellIndex] || { letter: '', state: 'empty' as LetterState };
                  const isCurrentCell = isCurrentRow && cellIndex === currentGuess.length;
                  const letter = isCurrentRow && cellIndex < currentGuess.length
                    ? currentGuess[cellIndex]
                    : cell.letter;

                  return (
                    <motion.div
                      key={cellIndex}
                      className={`
                        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center
                        text-xl sm:text-2xl font-bold rounded-md sm:rounded-lg
                        ${getCellColor(cell.state)}
                        ${isCurrentCell ? 'ring-2 ring-christmas-red' : ''}
                        transition-all duration-200
                      `}
                      initial={cell.state !== 'empty' ? { scale: 0.8, rotateY: 180 } : {}}
                      animate={cell.state !== 'empty' ? { scale: 1, rotateY: 0 } : {}}
                      transition={{ delay: cellIndex * 0.1 }}
                    >
                      {letter}
                    </motion.div>
                  );
                })}
              </motion.div>
            );
          })}
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
                Du hast das Wort erraten!
              </p>
            </motion.div>
          )}
          {gameState === 'lost' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mb-4 sm:mb-6 px-2"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-christmas-red mb-2">
                😢 Nicht geschafft
              </h2>
              <p className="text-base sm:text-lg text-gray-700 mb-2">
                Das Wort war: <span className="font-bold text-forest-green">{WORD}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Virtual Keyboard */}
        <div className="flex flex-col gap-1.5 sm:gap-2 px-1">
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 sm:gap-1.5 md:gap-2 justify-center flex-wrap">
              {row.map((key) => {
                const isSpecialKey = key === 'ENTER' || key === 'BACKSPACE';
                const displayKey = key === 'BACKSPACE' ? '⌫' : key;
                const isEnterKey = key === 'ENTER';

                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`
                      ${isSpecialKey 
                        ? isEnterKey 
                          ? 'px-2 sm:px-3 md:px-4 text-xs sm:text-sm' 
                          : 'px-2 sm:px-3 md:px-4 text-base sm:text-lg'
                        : 'px-1.5 sm:px-2 md:px-3 text-sm sm:text-base'
                      } 
                      py-2.5 sm:py-3 md:py-4 
                      rounded-md sm:rounded-lg 
                      font-semibold 
                      touch-manipulation
                      min-h-[44px]
                      min-w-[32px] sm:min-w-[36px] md:min-w-[40px]
                      transition-all
                      active:scale-95
                      select-none
                      ${key === 'ENTER' || key === 'BACKSPACE' 
                        ? 'bg-christmas-red text-white active:bg-soft-red' 
                        : getKeyColor(key)
                      }
                    `}
                  >
                    {displayKey}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

