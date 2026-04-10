import React, { useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Plot = {
  filename: string;
  title: string;
  src: string;
};

type ChartLightboxProps = {
  plots: Plot[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5000";

export function ChartLightbox({ plots, currentIndex, onClose, onNavigate }: ChartLightboxProps) {
  const isOpen = currentIndex !== null;
  const currentPlot = currentIndex !== null ? plots[currentIndex] : null;

  const handlePrev = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (currentIndex === null) return;
    const nextIdx = (currentIndex - 1 + plots.length) % plots.length;
    onNavigate(nextIdx);
  }, [currentIndex, plots.length, onNavigate]);

  const handleNext = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (currentIndex === null) return;
    const nextIdx = (currentIndex + 1) % plots.length;
    onNavigate(nextIdx);
  }, [currentIndex, plots.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev(e);
      if (e.key === "ArrowRight") handleNext(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen) return null;

  const imgSrc = currentPlot ? (currentPlot.src.startsWith('http') ? currentPlot.src : `${API_BASE}${currentPlot.src}`) : "";

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="lightbox-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-[210] p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
            aria-label="Close"
          >
            <X size={28} />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 md:left-8 z-[210] p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all group"
          >
            <ChevronLeft size={48} className="group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 md:right-8 z-[210] p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all group"
          >
            <ChevronRight size={48} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Content Container */}
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex flex-col items-center pointer-events-none w-full h-full justify-center p-12"
          >
            {/* Title Top */}
            <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
                <h2 className="text-lg font-semibold text-white tracking-wide">
                    {currentPlot?.title}
                </h2>
            </div>

            {/* Main Image */}
            <img
              src={imgSrc}
              alt={currentPlot?.title}
              className="max-w-[92vw] max-h-[88vh] object-contain pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter Bottom */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-white/90 font-medium text-sm">
                    {plots.findIndex(p => p.filename === currentPlot?.filename) + 1} / {plots.length}
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
