'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { DoorContent } from '@/data/doors';
import { useEffect } from 'react';

interface DoorModalProps {
  door: DoorContent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DoorModal({ door, isOpen, onClose }: DoorModalProps) {
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

  if (!door) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 touch-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 sm:inset-4 md:inset-8 lg:inset-24 z-50 flex items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-cream to-warm-beige rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full h-full sm:h-auto max-h-[100vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-3 sm:p-2 rounded-full bg-white/90 hover:bg-white active:bg-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X size={24} className="sm:w-5 sm:h-5 text-gray-700" />
              </button>

              {/* Content */}
              <div className="p-5 sm:p-6 md:p-8 pt-12 sm:pt-6">
                {/* Header */}
                <div className="text-center mb-5 sm:mb-6">
                  <motion.div
                    className="inline-block text-5xl sm:text-6xl font-bold text-christmas-red mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    {door.date}
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-forest-green mb-2 px-2">
                    {door.title}
                  </h2>
                </div>

                {/* Image */}
                {door.image && (
                  <motion.div
                    className="w-full h-200 sm:h-48 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden mb-5 sm:mb-6 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <img
                      src={door.image}
                      alt={door.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Hide image if it fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </motion.div>
                )}

                {/* Message */}
                <motion.div
                  className="prose prose-lg max-w-none mb-5 sm:mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-xl text-xxl text-gray-700 leading-relaxed font-cute px-1 whitespace-pre-line">
                    {door.message}
                  </p>
                </motion.div>

                {/* Extra content */}
                {door.extra && (
                  <motion.div
                    className="bg-blush-pink/30 rounded-xl p-4 mb-5 sm:mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 italic">
                      {door.extra}
                    </p>
                  </motion.div>
                )}

                {/* Link */}
                {door.link && (
                  <motion.a
                    href={door.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 bg-christmas-red text-white rounded-full active:bg-soft-red sm:hover:bg-soft-red transition-colors shadow-lg touch-manipulation min-h-[44px] text-base sm:text-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span>Open Surprise</span>
                    <ExternalLink size={18} className="sm:w-4 sm:h-4" />
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

