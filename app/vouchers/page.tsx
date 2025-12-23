'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gift, Heart, X } from 'lucide-react';
import Link from 'next/link';

// Voucher types: 3x 15min, 2x 20min, 1x 30min
const VOUCHER_TYPES = [
  { minutes: 15, label: '15 Minuten' },
  { minutes: 15, label: '15 Minuten' },
  { minutes: 15, label: '15 Minuten' },
  { minutes: 20, label: '20 Minuten' },
  { minutes: 20, label: '20 Minuten' },
  { minutes: 30, label: '30 Minuten' },
];

// Shuffle array function
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface Voucher {
  id: number;
  minutes: number;
  label: string;
  scratched: boolean;
}

interface ScratchCardComponentProps {
  voucher: Voucher;
  onComplete: () => void;
  width: number;
  height: number;
}

function ScratchCardComponent({ voucher, onComplete, width, height }: ScratchCardComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScratchingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set CSS size to logical dimensions
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // High DPI support - set internal size to device pixels
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Create scratch-off overlay with pattern
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#cbd5e1');
    gradient.addColorStop(0.5, '#94a3b8');
    gradient.addColorStop(1, '#64748b');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add text pattern
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Repeat text pattern
    for (let x = 0; x < width; x += 100) {
      for (let y = 0; y < height; y += 70) {
        ctx.fillText('SCRATCH', x + 50, y + 35);
      }
    }
  }, [width, height]);

  const getCoordinates = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Calculate coordinates relative to canvas element
    // Since we scale the context by DPR, we use logical coordinates (not multiplied by DPR)
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    return { x, y };
  };

  const scratch = (clientX: number, clientY: number) => {
    if (voucher.scratched) return;

    const coords = getCoordinates(clientX, clientY);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 50;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPosRef.current = coords;

    // Check scratched percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;
    const totalPixels = pixels.length / 4;
    
    // Sample every 16th pixel for performance
    for (let i = 3; i < pixels.length; i += 64) {
      if (pixels[i] < 128) transparentCount++;
    }

    const sampleCount = totalPixels / 16;
    const scratchedPercent = (transparentCount / sampleCount) * 100;

    if (scratchedPercent > 50) {
      onComplete();
    }
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (voucher.scratched) return;
    e.preventDefault();
    e.stopPropagation();
    
    isScratchingRef.current = true;
    lastPosRef.current = null;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    scratch(clientX, clientY);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratchingRef.current || voucher.scratched) return;
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    scratch(clientX, clientY);
  };

  const handleEnd = () => {
    isScratchingRef.current = false;
    lastPosRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg"
      style={{ width, height }}
    >
      {/* Voucher content underneath */}
      <div className="absolute inset-0 bg-gradient-to-br from-christmas-red via-soft-red to-blush-pink flex flex-col items-center justify-center text-white p-4">
        <Gift className="w-20 h-20 sm:w-24 sm:h-24 mb-4" />
        <div className="text-center">
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            {voucher.label}
          </div>
          <div className="text-xl sm:text-2xl opacity-90">
            Massage
          </div>
        </div>
      </div>

      {/* Scratch canvas overlay */}
      {!voucher.scratched && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none cursor-pointer"
          style={{ width: '100%', height: '100%' }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onTouchCancel={handleEnd}
        />
      )}
    </div>
  );
}

interface VoucherPreviewProps {
  voucher: Voucher;
  onClick: () => void;
}

function VoucherPreview({ voucher, onClick }: VoucherPreviewProps) {
  return (
    <motion.button
      onClick={onClick}
      className="aspect-square relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg touch-manipulation w-full"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {voucher.scratched ? (
        <div className="absolute inset-0 bg-gradient-to-br from-christmas-red via-soft-red to-blush-pink flex flex-col items-center justify-center text-white p-4">
          <Gift className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3" />
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
              {voucher.label}
            </div>
            <div className="text-sm sm:text-base opacity-90">
              Massage
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-christmas-red/20 via-blush-pink/20 to-soft-gold/20 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-4xl sm:text-5xl md:text-6xl"
          >
            ❓
          </motion.div>
        </div>
      )}
    </motion.button>
  );
}

interface ScratchModalProps {
  voucher: Voucher | null;
  isOpen: boolean;
  onClose: () => void;
  onScratchComplete: (id: number) => void;
}

function ScratchModal({ voucher, isOpen, onClose, onScratchComplete }: ScratchModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Calculate dimensions for the scratch card
  useEffect(() => {
    if (!containerRef.current || !isOpen) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        // Use viewport dimensions for larger card
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 64; // Total padding (32px each side on mobile, more on desktop)
        const headerSpace = 120; // Space for header/instructions
        const maxWidth = Math.min(viewportWidth - padding, 700);
        const maxHeight = viewportHeight - padding - headerSpace;
        
        // Calculate width and height maintaining 4:3 aspect ratio
        let width = maxWidth;
        let height = Math.round(width * 0.75);
        
        // If height is too large, adjust width
        if (height > maxHeight) {
          height = maxHeight;
          width = Math.round(height / 0.75);
        }
        
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isOpen]);

  if (!voucher) return null;

  const handleComplete = () => {
    onScratchComplete(voucher.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 touch-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              ref={containerRef}
              className="relative bg-gradient-to-br from-cream to-warm-beige rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 md:p-8"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white active:bg-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X size={24} className="text-gray-700" />
              </button>

              {/* Instructions */}
              {!voucher.scratched && (
                <div className="text-center mb-4 sm:mb-6">
                  <p className="text-sm sm:text-base text-gray-600">
                    Reibe über die Karte, um den Gutschein zu enthüllen! 👆
                  </p>
                </div>
              )}

              {/* Scratch Card */}
              <div className="flex justify-center">
                <ScratchCardComponent
                  voucher={voucher}
                  onComplete={handleComplete}
                  width={dimensions.width}
                  height={dimensions.height}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const shuffled = shuffleArray(VOUCHER_TYPES);
    return shuffled.map((v, i) => ({
      id: i,
      minutes: v.minutes,
      label: v.label,
      scratched: false,
    }));
  });

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVoucherClick = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedVoucher(null);
    }, 300);
  };

  const handleScratchComplete = (id: number) => {
    setVouchers(prev =>
      prev.map(voucher => {
        if (voucher.id === id) {
          return {
            ...voucher,
            scratched: true,
          };
        }
        return voucher;
      })
    );

    // Update selected voucher if it's the one being scratched
    if (selectedVoucher && selectedVoucher.id === id) {
      setSelectedVoucher(prev => prev ? {
        ...prev,
        scratched: true,
      } : null);
    }
  };

  const revealedCount = vouchers.filter(v => v.scratched).length;
  const totalCount = vouchers.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-beige to-blush-pink/30 flex flex-col items-center justify-start sm:justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 px-2 sm:px-0">
          <Link
            href="/"
            className="flex items-center gap-1 sm:gap-2 text-christmas-red active:text-soft-red transition-colors touch-manipulation min-h-[44px] min-w-[44px] justify-center"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold hidden xs:inline">Zurück</span>
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-christmas-red via-blush-pink to-soft-gold bg-clip-text text-transparent">
            Massage-Gutscheine
          </h1>
          <div className="w-20 sm:w-24" /> {/* Spacer for centering */}
        </div>

        {/* Progress */}
        <div className="text-center mb-6 sm:mb-8 px-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-md inline-block">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Gefunden</div>
            <div className="text-2xl sm:text-3xl font-bold text-christmas-red">
              {revealedCount} / {totalCount}
            </div>
          </div>
        </div>

        {/* Instructions */}
        {revealedCount < totalCount && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8 px-2"
          >
            <p className="text-sm sm:text-base text-gray-600">
              Klicke auf eine Karte, um sie zu öffnen und zu reiben! 💕
            </p>
          </motion.div>
        )}

        {/* Voucher Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0 mb-6 sm:mb-8">
          {vouchers.map((voucher, index) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <VoucherPreview
                voucher={voucher}
                onClick={() => handleVoucherClick(voucher)}
              />
            </motion.div>
          ))}
        </div>

        {/* Completion Message */}
        <AnimatePresence>
          {revealedCount === totalCount && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="text-center px-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-block mb-4"
              >
                <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-christmas-red fill-christmas-red" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-christmas-red mb-4"
              >
                🎉 Alle Gutscheine gefunden! 🎉
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto"
              >
                Viel massieri für dich
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scratch Modal */}
        <ScratchModal
          voucher={selectedVoucher}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onScratchComplete={handleScratchComplete}
        />
      </div>
    </div>
  );
}
