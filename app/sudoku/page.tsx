'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCw, Check } from 'lucide-react';
import Link from 'next/link';

const GRID_SIZE = 5;
const BOX_ROWS = 5; // Not used since we're not using box constraints
const BOX_COLS = 5; // Not used since we're not using box constraints

// Use the first 5 memory images for the 5x5 Sudoku pieces
const IMAGES = [
  '/images/sudoku/1.JPG',
  '/images/sudoku/2.JPG',
  '/images/sudoku/3.JPG',
  '/images/sudoku/4.JPG',
  '/images/sudoku/5.JPG',
];

type CellValue = number | null; // null means empty, number is the image index (0-4)

interface Cell {
  value: CellValue;
  isGiven: boolean; // Pre-filled cells that can't be changed
  isSelected: boolean;
  hasError: boolean;
}

// Generate a valid 6x6 Sudoku solution
const generateSolution = (retries: number = 0): number[][] => {
  // Start with empty grid
  const grid: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  
  // Helper to check if placing a number at position (r, c) is valid
  const isValid = (r: number, c: number, num: number): boolean => {
    // Check row
    for (let col = 0; col < GRID_SIZE; col++) {
      if (col !== c && grid[r][col] === num) return false;
    }
    
    // Check column
    for (let row = 0; row < GRID_SIZE; row++) {
      if (row !== r && grid[row][c] === num) return false;
    }
    
    // Check box (2x3 boxes)
    const boxStartRow = Math.floor(r / BOX_ROWS) * BOX_ROWS;
    const boxStartCol = Math.floor(c / BOX_COLS) * BOX_COLS;
    for (let i = boxStartRow; i < boxStartRow + BOX_ROWS; i++) {
      for (let j = boxStartCol; j < boxStartCol + BOX_COLS; j++) {
        if ((i !== r || j !== c) && grid[i][j] === num) return false;
      }
    }
    
    return true;
  };
  
  // Backtracking solver
  const solve = (row: number, col: number): boolean => {
    // If we've filled all rows, we're done
    if (row === GRID_SIZE) return true;
    
    // Move to next row if we've filled all columns in this row
    if (col === GRID_SIZE) return solve(row + 1, 0);
    
    // Skip cells that are already filled
    if (grid[row][col] !== 0) return solve(row, col + 1);
    
    // Try each number (0-4 for 5x5)
    const nums = [0, 1, 2, 3, 4];
    // Shuffle for randomness
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    
    for (const num of nums) {
      if (isValid(row, col, num)) {
        grid[row][col] = num;
        if (solve(row, col + 1)) return true;
        // Backtrack
        grid[row][col] = 0;
      }
    }
    
    return false;
  };
  
  // Fill the grid using backtracking
  // For 6x6 with 2x3 boxes, we can start from scratch and it will solve
  const success = solve(0, 0);
  
  if (!success && retries < 5) {
    // If solving fails, try again with a fresh grid (should be very rare)
    console.warn('Sudoku generation failed, retrying...');
    return generateSolution(retries + 1);
  }
  
  if (!success) {
    console.error('Failed to generate valid Sudoku after multiple attempts');
    // Return a fallback valid grid (5x5, no box constraint, just rows/columns)
    return [
      [0, 1, 2, 3, 4],
      [1, 2, 3, 4, 0],
      [2, 3, 4, 0, 1],
      [3, 4, 0, 1, 2],
      [4, 0, 1, 2, 3]
    ];
  }
  
  return grid;
};

// Remove cells to create the puzzle (difficulty: ~8-10 cells removed = easier with more clues for 5x5)
// This ensures enough clues with balanced image distribution
const createPuzzle = (solution: number[][], difficulty: number = 9): Cell[][] => {
  const totalCells = GRID_SIZE * GRID_SIZE;
  // Ensure difficulty doesn't exceed available cells (leave at least 1 cell filled)
  const maxDifficulty = totalCells - 1;
  const actualDifficulty = Math.min(difficulty, maxDifficulty);
  const targetKept = totalCells - actualDifficulty; // ~16 cells (5x5 = 25, remove 9 = keep 16)
  
  const grid: Cell[][] = solution.map(row => 
    row.map(val => ({ value: val, isGiven: true, isSelected: false, hasError: false }))
  );
  
  // Strategy: Ensure balanced distribution of images in clues
  // Each image (0-4) should appear roughly equally in the clues
  const imageCounts = new Map<number, number>(); // Track how many times each image appears in clues
  for (let i = 0; i < 5; i++) imageCounts.set(i, 0);
  
  // Target: each image should appear about (targetKept / 5) times, but at least 2 times
  const targetPerImage = Math.floor(targetKept / 5);
  const minPerImage = 2;
  const maxPerImage = Math.ceil(targetKept / 5) + 1;
  
  const cellsToKeep = new Set<number>();
  const availableCells: number[] = [];
  
  // First pass: Try to ensure each image appears at least minPerImage times
  for (let image = 0; image < 5; image++) {
    const cellsWithImage: number[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (solution[row][col] === image) {
          cellsWithImage.push(row * GRID_SIZE + col);
        }
      }
    }
    
    // Shuffle to add randomness
    for (let i = cellsWithImage.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cellsWithImage[i], cellsWithImage[j]] = [cellsWithImage[j], cellsWithImage[i]];
    }
    
    // Keep minPerImage cells for this image
    const count = imageCounts.get(image) || 0;
    const toKeep = Math.min(minPerImage, cellsWithImage.length);
    for (let i = 0; i < toKeep && cellsToKeep.size < targetKept; i++) {
      cellsToKeep.add(cellsWithImage[i]);
      imageCounts.set(image, count + 1);
    }
  }
  
  // Second pass: Fill remaining slots trying to balance images
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const idx = row * GRID_SIZE + col;
      if (!cellsToKeep.has(idx)) {
        availableCells.push(idx);
      }
    }
  }
  
  // Shuffle available cells
  for (let i = availableCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableCells[i], availableCells[j]] = [availableCells[j], availableCells[i]];
  }
  
  // Add remaining cells, prioritizing images that are underrepresented
  for (const idx of availableCells) {
    if (cellsToKeep.size >= targetKept) break;
    
    const row = Math.floor(idx / GRID_SIZE);
    const col = idx % GRID_SIZE;
    const image = solution[row][col];
    const currentCount = imageCounts.get(image) || 0;
    
    // Prefer images that haven't reached their target yet
    if (currentCount < maxPerImage) {
      cellsToKeep.add(idx);
      imageCounts.set(image, currentCount + 1);
    }
  }
  
  // If we still need more cells, add them (should be rare)
  for (const idx of availableCells) {
    if (cellsToKeep.size >= targetKept) break;
    if (!cellsToKeep.has(idx)) {
      cellsToKeep.add(idx);
    }
  }
  
  // Remove all cells that are NOT in cellsToKeep
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const idx = row * GRID_SIZE + col;
      if (!cellsToKeep.has(idx)) {
        grid[row][col] = { value: null, isGiven: false, isSelected: false, hasError: false };
      }
    }
  }
  
  return grid;
};

export default function SudokuPage() {
  const [grid, setGrid] = useState<Cell[][]>(() => {
    const solution = generateSolution();
    return createPuzzle(solution);
  });
  const [solution, setSolution] = useState<number[][]>(() => generateSolution());
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [key, setKey] = useState(0); // For reset


  // Mark errors when grid values change
  const updateErrors = useCallback(() => {
    if (gameState !== 'playing') return;
    
    setGrid(prev => {
      const newGrid = prev.map((row, r) =>
        row.map((cell, c) => {
          if (cell.isGiven || cell.value === null) {
            return { ...cell, hasError: false };
          }
          // Check if value is valid (only rows and columns for 5x5, no boxes)
          let isValid = true;
          
          // Check row
          for (let col = 0; col < GRID_SIZE; col++) {
            if (col !== c && prev[r][col].value === cell.value) {
              isValid = false;
              break;
            }
          }
          
          // Check column
          if (isValid) {
            for (let rowIdx = 0; rowIdx < GRID_SIZE; rowIdx++) {
              if (rowIdx !== r && prev[rowIdx][c].value === cell.value) {
                isValid = false;
                break;
              }
            }
          }
          
          // No box check for 5x5 (makes it easier)
          
          return { ...cell, hasError: !isValid };
        })
      );
      return newGrid;
    });
  }, [gameState]);
  
  // Track grid values as a string to detect changes
  const gridValuesString = grid.map(row => row.map(cell => cell.value ?? 'null').join(',')).join('|');
  
  // Update errors after grid values change (debounced to avoid infinite loops)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateErrors();
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridValuesString]);

  // Check win condition
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    let isComplete = true;
    let hasErrors = false;
    
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].value === null) {
          isComplete = false;
        }
        if (grid[r][c].hasError) {
          hasErrors = true;
        }
      }
    }
    
    if (isComplete && !hasErrors) {
      // Double-check against solution
      let isCorrect = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (grid[r][c].value !== solution[r][c]) {
            isCorrect = false;
            break;
          }
        }
        if (!isCorrect) break;
      }
      
      if (isCorrect) {
        setGameState('won');
      }
    }
  }, [grid, solution, gameState]);

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isGiven || gameState === 'won') return;
    setSelectedCell({ row, col });
  };

  const handleImageSelect = (imageIndex: number) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    if (grid[row][col].isGiven) return;
    
    setGrid(prev => {
      const newGrid = prev.map((r, rIdx) =>
        r.map((cell, cIdx) => {
          if (rIdx === row && cIdx === col) {
            // Toggle if same image selected
            const newValue = cell.value === imageIndex ? null : imageIndex;
            return { ...cell, value: newValue, isSelected: false };
          }
          return { ...cell, isSelected: false };
        })
      );
      return newGrid;
    });
    
    setSelectedCell(null);
  };

  const resetGame = () => {
    const newSolution = generateSolution();
    const newPuzzle = createPuzzle(newSolution);
    setSolution(newSolution);
    setGrid(newPuzzle);
    setSelectedCell(null);
    setGameState('playing');
    setKey(prev => prev + 1);
  };

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
            Sudoku
          </h1>
          <button
            onClick={resetGame}
            className="flex items-center gap-1 sm:gap-2 text-christmas-red active:text-soft-red transition-colors touch-manipulation min-h-[44px] min-w-[44px] justify-center"
          >
            <RotateCw size={20} className="sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold hidden sm:inline">Neu</span>
          </button>
        </div>

        {/* Win Modal */}
        {gameState === 'won' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-cream to-warm-beige rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full"
            >
              <div className="text-center">
                <motion.h2
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-4xl sm:text-5xl font-bold text-forest-green mb-4"
                >
                  🎉 Du hast es geschafft! 🎉
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg sm:text-xl text-gray-700 mb-6"
                >
                  Du hast das Sudoku gelöst!
                </motion.p>

                <motion.button
                  onClick={resetGame}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full py-4 bg-christmas-red text-white rounded-xl font-semibold text-lg sm:text-xl active:bg-soft-red transition-colors shadow-lg touch-manipulation min-h-[44px] flex items-center justify-center gap-2"
                >
                  <RotateCw size={24} />
                  <span>Nochmal spielen</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Instructions */}
        {gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 sm:mb-6 text-center px-2"
          >
            <p className="text-sm sm:text-base text-gray-600">
              Jede Zeile und Spalte muss jedes Bild genau einmal enthalten. Klicke auf ein leeres Feld und wähle dann ein Bild aus.
            </p>
          </motion.div>
        )}

        {/* Sudoku Grid */}
        <div className="flex justify-center mb-4 sm:mb-6 px-2 sm:px-0">
          <div
            key={key}
            className="grid gap-1 bg-christmas-red p-1 rounded-lg shadow-xl"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: '100%',
              maxWidth: '600px',
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const boxRow = Math.floor(rowIndex / BOX_ROWS);
                const boxCol = Math.floor(colIndex / BOX_COLS);
                const isBoxBorder = colIndex % BOX_COLS === 0 || rowIndex % BOX_ROWS === 0;
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                
                return (
                  <motion.button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={cell.isGiven || gameState === 'won'}
                    className={`
                      aspect-square relative rounded overflow-hidden
                      touch-manipulation select-none
                      ${cell.isGiven 
                        ? 'bg-white/90 cursor-not-allowed' 
                        : isSelected
                        ? 'bg-soft-gold ring-4 ring-christmas-red'
                        : cell.hasError
                        ? 'bg-red-200 ring-2 ring-red-500'
                        : 'bg-white/90 hover:bg-white cursor-pointer'
                      }
                      transition-all duration-200
                    `}
                    whileHover={!cell.isGiven && gameState === 'playing' ? { scale: 1.05 } : {}}
                    whileTap={!cell.isGiven && gameState === 'playing' ? { scale: 0.95 } : {}}
                  >
                    {cell.value !== null && (
                      <img
                        src={IMAGES[cell.value]}
                        alt={`Sudoku piece ${cell.value + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    {cell.isGiven && (
                      <div className="absolute top-1 left-1">
                        <Check size={12} className="text-forest-green" />
                      </div>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Image Palette */}
        {selectedCell && gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 sm:mb-6 px-2 sm:px-0"
          >
            <p className="text-center text-sm sm:text-base text-gray-700 mb-3 font-semibold">
              Wähle ein Bild aus:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 max-w-2xl mx-auto">
              {IMAGES.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleImageSelect(index)}
                  className="aspect-square rounded-lg overflow-hidden border-4 border-christmas-red bg-white hover:border-soft-gold transition-all shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <img
                    src={image}
                    alt={`Option ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </motion.button>
              ))}
              {/* Clear button */}
              <motion.button
                onClick={() => {
                  if (selectedCell) {
                    const { row, col } = selectedCell;
                    setGrid(prev => {
                      const newGrid = prev.map((r, rIdx) =>
                        r.map((cell, cIdx) => {
                          if (rIdx === row && cIdx === col) {
                            return { ...cell, value: null, isSelected: false };
                          }
                          return { ...cell, isSelected: false };
                        })
                      );
                      return newGrid;
                    });
                    setSelectedCell(null);
                  }
                }}
                className="aspect-square rounded-lg border-4 border-gray-400 bg-gray-200 hover:border-gray-600 transition-all shadow-lg flex items-center justify-center text-2xl font-bold text-gray-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

