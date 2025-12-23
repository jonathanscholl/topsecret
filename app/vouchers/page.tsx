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
  scratchedPercent: number;
}

interface ScratchCardProps {
  voucher: Voucher;
  onScratch: (id: number, percent: number) => void;
  size?: 'small' | 'large';
}

function ScratchCard({ voucher, onScratch, size = 'large' }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Create scratch-off overlay with pattern
    const gradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
    gradient.addColorStop(0, '#cbd5e1');
    gradient.addColorStop(0.5, '#94a3b8');
    gradient.addColorStop(1, '#64748b');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Add text pattern
    ctx.fillStyle = '#475569';
    const fontSize = size === 'large' ? 32 : 20;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const stepX = size === 'large' ? 100 : 70;
    const stepY = size === 'large' ? 70 : 50;
    
    // Repeat text pattern
    for (let x = 0; x < dimensions.width; x += stepX) {
      for (let y = 0; y < dimensions.height; y += stepY) {
        ctx.fillText('SCRATCH', x + stepX / 2, y + stepY / 2);
      }
    }
  }, [dimensions, size]);

  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const checkScratchedPercent = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;
    const totalPixels = pixels.length / 4;
    
    // Check every 16th pixel (alpha channel) for performance
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] < 128) transparentCount++;
    }

    const sampleCount = totalPixels / 4;
    const scratchedPercent = (transparentCount / sampleCount) * 100;
    onScratch(voucher.id, scratchedPercent);

    return scratchedPercent > 50;
  };

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (voucher.scratched) return;

    const pos = getEventPos(e);
    if (!pos) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    const brushSize = size === 'large' ? 50 : 40;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPosRef.current = pos;

    // Check scratched percentage periodically (throttled for performance)
    if (Math.random() < 0.15) { // Check ~15% of the time while scratching
      const isComplete = checkScratchedPercent(ctx, canvas);
      if (isComplete) {
        setIsScratching(false);
        lastPosRef.current = null;
      }
    }
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (voucher.scratched) return;
    e.preventDefault();
    e.stopPropagation();
    lastPosRef.current = null;
    setIsScratching(true);
    scratch(e);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching || voucher.scratched) return;
    e.preventDefault();
    e.stopPropagation();
    scratch(e);
  };

  const handleEnd = () => {
    // Check scratched percentage when ending
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && !voucher.scratched) {
      checkScratchedPercent(ctx, canvas);
    }

    setIsScratching(false);
    lastPosRef.current = null;
  };

  const cardClasses = size === 'large' 
    ? 'w-full max-w-md mx-auto aspect-[4/3]'
    : 'aspect-square';

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg touch-none ${cardClasses}`}
      style={{ width: size === 'small' ? '100%' : '100%' }}
    >
      {/* Voucher content underneath */}
      <div className="absolute inset-0 bg-gradient-to-br from-christmas-red via-soft-red to-blush-pink flex flex-col items-center justify-center text-white p-4">
        <Gift className={size === 'large' ? 'w-20 h-20 sm:w-24 sm:h-24 mb-4' : 'w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3'} />
        <div className="text-center">
          <div className={size === 'large' ? 'text-3xl sm:text-4xl md:text-5xl font-bold mb-2' : 'text-lg sm:text-xl md:text-2xl font-bold mb-1'}>
            {voucher.label}
          </div>
          <div className={size === 'large' ? 'text-xl sm:text-2xl opacity-90' : 'text-sm sm:text-base opacity-90'}>
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
  onScratch: (id: number, percent: number) => void;
}

function ScratchModal({ voucher, isOpen, onClose, onScratch }: ScratchModalProps) {
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

  if (!voucher) return null;

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
            <div className="relative bg-gradient-to-br from-cream to-warm-beige rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8">
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
              <ScratchCard
                voucher={voucher}
                onScratch={onScratch}
                size="large"
              />
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
      scratchedPercent: 0,
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

  const handleScratch = (id: number, percent: number) => {
    setVouchers(prev =>
      prev.map(voucher => {
        if (voucher.id === id) {
          const isScratched = percent > 50;
          return {
            ...voucher,
            scratched: isScratched,
            scratchedPercent: percent,
          };
        }
        return voucher;
      })
    );

    // Update selected voucher if it's the one being scratched
    if (selectedVoucher && selectedVoucher.id === id) {
      setSelectedVoucher(prev => prev ? {
        ...prev,
        scratched: percent > 50,
        scratchedPercent: percent,
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
          onScratch={handleScratch}
        />
      </div>
    </div>
  );
}
