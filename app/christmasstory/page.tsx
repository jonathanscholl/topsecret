'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChristmasStoryPage() {
  const [countdown, setCountdown] = useState(5);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown === 0) {
      setShowVideo(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-play video when countdown finishes
  useEffect(() => {
    if (!showVideo) return;

    const video = videoRef.current;
    if (!video) return;

    // Start muted for reliable autoplay (mobile browsers often block unmuted autoplay)
    // Then try to unmute immediately after play starts
    const playVideo = async () => {
      try {
        // Start muted to ensure autoplay works
        video.muted = true;
        await video.play();
        
        // Try to unmute immediately after play starts
        // This works because the countdown can be considered user interaction
        setTimeout(() => {
          try {
            video.muted = false;
          } catch (e) {
            // If unmuting fails, video will stay muted and user can unmute via controls
          }
        }, 100);
      } catch (error) {
        console.error('Video autoplay failed:', error);
      }
    };

    // Handler for when video metadata is loaded
    const handleLoadedData = () => {
      playVideo();
    };

    // If video is already loaded, try playing immediately
    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener('loadeddata', handleLoadedData);
    }

    // Also try playing after a short delay as fallback
    const timeout = setTimeout(() => {
      if (video.paused) {
        playVideo();
      }
    }, 500);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      clearTimeout(timeout);
    };
  }, [showVideo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-beige to-blush-pink/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header with back button */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-christmas-red active:text-soft-red transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft size={24} className="sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold">Zurück</span>
          </Link>
        </div>

        {/* Content */}
        <div className="relative w-full">
          <AnimatePresence mode="wait">
            {!showVideo ? (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh]"
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-6xl sm:text-8xl md:text-9xl font-bold text-christmas-red"
                >
                  {countdown}
                </motion.div>
                {countdown > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-soft-red font-semibold"
                  >
                    Das Video startet gleich...
                  </motion.p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full"
              >
                <video
                  ref={videoRef}
                  className="w-full h-auto rounded-lg shadow-2xl"
                  controls
                  playsInline
                  autoPlay
                  preload="auto"
                  muted
                >
                  <source src="/videos/day12.MP4" type="video/mp4" />
                  Dein Browser unterstützt das Video-Format nicht.
                </video>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

