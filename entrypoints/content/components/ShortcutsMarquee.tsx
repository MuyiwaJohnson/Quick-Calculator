import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Shortcut {
  keys: string[];
  description: string;
  color: string;
}

interface ShortcutsMarqueeProps {
  isVisible: boolean;
}

const SHORTCUTS: Shortcut[] = [
  {
    keys: ["Ctrl", "Z"],
    description: "Undo",
    color: "text-blue-400"
  },
  {
    keys: ["Ctrl", "Y"],
    description: "Redo", 
    color: "text-green-400"
  },
  {
    keys: ["Ctrl", "Shift", "Z"],
    description: "Redo",
    color: "text-green-400"
  },
  {
    keys: ["Ctrl", "R"],
    description: "Reset",
    color: "text-red-400"
  },
  {
    keys: ["Double-click"],
    description: "Add number",
    color: "text-purple-400"
  }
];

export const ShortcutsMarquee: React.FC<ShortcutsMarqueeProps> = ({ isVisible }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate through shortcuts every 6 seconds
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHORTCUTS.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const currentShortcut = useMemo(() => SHORTCUTS[currentIndex], [currentIndex]);

  if (!isVisible) return null;

  return (
    <div className="border-t border-[#333] pt-2 mt-2 opacity-60">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center justify-center gap-2 text-xs select-none"
        >
          <span className="text-[#999]">Shortcut:</span>
          
          <div className="flex items-center gap-1">
            {currentShortcut.keys.map((key, keyIndex) => (
              <React.Fragment key={keyIndex}>
                <kbd className={`px-1.5 py-0.5 text-[10px] font-mono bg-[#2a2a2a] border border-[#444] rounded ${currentShortcut.color}`}>
                  {key}
                </kbd>
                {keyIndex < currentShortcut.keys.length - 1 && (
                  <span className="text-[#777] text-[10px]">+</span>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <span className="text-[#bbb]">→</span>
          <span className={`font-medium ${currentShortcut.color}`}>
            {currentShortcut.description}
          </span>
        </motion.div>
      </AnimatePresence>
      
      {/* Progress indicator */}
      <div className="flex justify-center gap-1 mt-1">
        {SHORTCUTS.map((_, index) => (
          <motion.div
            key={index}
            className={`w-1 h-1 rounded-full ${
              index === currentIndex ? "bg-[#666]" : "bg-[#333]"
            }`}
            animate={{
              scale: index === currentIndex ? 1.2 : 1,
              opacity: index === currentIndex ? 1 : 0.5
            }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </div>
    </div>
  );
}; 