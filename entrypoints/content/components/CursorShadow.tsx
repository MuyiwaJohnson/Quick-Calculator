import { motion, MotionValue } from "motion/react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { isNumberTooLarge, isMotionValue } from "../utils/utils";
import type { CalculatorOperation } from "../../../types";
import { CalculatorHeader } from "./CalculatorHeader";
import { OperationBar } from "./OperationBar";
import { HistoryList } from "./HistoryList";
import { TotalDisplay } from "./TotalDisplay";
import { ShortcutsMarquee } from "./ShortcutsMarquee";

interface Props {
  x: MotionValue<number>;
  y: MotionValue<number>;
  total: number;
  history: Array<{ value: number; operation: CalculatorOperation }>;
  isVisible: boolean;
  onOperation?: (operation: CalculatorOperation) => void;
  currentOperation?: CalculatorOperation;
  onCopy?: (text: string) => void;
  followCursor?: boolean;
  onRemove?: () => void;
  onReset: () => void;
  onDeleteHistoryItem?: (index: number) => void;
  onEditHistoryItem?: (index: number, newValue: number) => void;
}


// Constants
const CALCULATOR_DIMENSIONS = { width: 360, height: 320 };
const POSITION_MARGIN = 20;
const CURSOR_OFFSET = 50;
const RESIZE_THROTTLE_MS = 100;

const OPERATIONS = [
  { symbol: "+", label: "Add", color: "#22c55e" },
  { symbol: "-", label: "Subtract", color: "#ef4444" },
  { symbol: "×", label: "Multiply", color: "#3b82f6" },
  { symbol: "÷", label: "Divide", color: "#a21caf" },
  { symbol: "%", label: "Percentage", color: "#f59e42" },
];

const ANIMATION_CONFIG = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

export const CursorShadow: React.FC<Props> = React.memo(({
  x,
  y,
  total = 0,
  history = [],
  isVisible = false,
  onOperation,
  currentOperation = "+",
  onCopy,
  followCursor = true,
  onRemove,
  onReset,
  onDeleteHistoryItem,
  onEditHistoryItem,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, flipUp: false });
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  // Window resize handler with throttling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const throttledUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, RESIZE_THROTTLE_MS);
    };

    updateDimensions();
    window.addEventListener("resize", throttledUpdate);
    
    return () => {
      window.removeEventListener("resize", throttledUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  // Position calculation
  const calculatePosition = useCallback((cursorX: number, cursorY: number) => {
    const { width: calcWidth, height: calcHeight } = CALCULATOR_DIMENSIONS;
    const { width: winWidth, height: winHeight } = windowDimensions;
    
    let newTop = cursorY + CURSOR_OFFSET;
    let newLeft = cursorX + CURSOR_OFFSET;
    let flipUp = false;

    // Check if calculator would go below viewport
    if (cursorY + CURSOR_OFFSET + calcHeight + POSITION_MARGIN > winHeight) {
      flipUp = true;
      newTop = cursorY - calcHeight - CURSOR_OFFSET;
    }

    // Ensure calculator stays within viewport bounds
    newTop = Math.max(POSITION_MARGIN, 
      Math.min(newTop, winHeight - calcHeight - POSITION_MARGIN));
    newLeft = Math.max(POSITION_MARGIN, 
      Math.min(newLeft, winWidth - calcWidth - POSITION_MARGIN));

    return { top: newTop, left: newLeft, flipUp };
  }, [windowDimensions]);

  // Position update effect
  useEffect(() => {
    if (!followCursor || !isVisible) return;
    
    if (!isMotionValue(x) || !isMotionValue(y)) {
      console.error("x or y is not a MotionValue", x, y);
      return;
    }

    const updatePosition = () => {
      const cursorX = x.get();
      const cursorY = y.get();
      setPosition(calculatePosition(cursorX, cursorY));
    };

    const unsubscribeX = x.on("change", updatePosition);
    const unsubscribeY = y.on("change", updatePosition);
    
    updatePosition();

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y, isVisible, followCursor, calculatePosition]);

  // Memoized handlers
  const handleCopyTotal = useCallback(() => {
    onCopy?.(total.toLocaleString());
  }, [total, onCopy]);

  const handleOperationClick = useCallback((symbol: CalculatorOperation) => {
    onOperation?.(symbol);
  }, [onOperation]);

  // Memoized computed values
  const totalFontSize = useMemo(() => {
    const abs = Math.abs(total);
    if (abs >= 1e12) return 14;
    if (abs >= 1e9) return 16;
    return 20;
  }, [total]);

  const isTotalTooLarge = useMemo(() => isNumberTooLarge(total), [total]);

  const containerStyle = useMemo(() => {
    if (followCursor) {
      return {
        top: position.top,
        left: position.left,
        position: "fixed" as const,
        zIndex: 9999,
      };
    }
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      position: "fixed" as const,
      zIndex: 9999,
    };
  }, [followCursor, position]);

  const animationProps = useMemo(() => ({
    initial: {
      opacity: 0,
      scale: 0.8,
      y: position.flipUp ? 10 : -10,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: ANIMATION_CONFIG,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: position.flipUp ? 10 : -10,
    },
    whileHover: { scale: 1.02 },
    transition: ANIMATION_CONFIG,
  }), [position.flipUp]);

  return (
    <motion.div
      data-calculator-ui
      id="calculator-ui"
      style={containerStyle}
      className="min-w-[288px] max-w-[360px] min-h-[276px] max-h-[346px] bg-[rgba(20,20,20,0.98)] text-white rounded-2xl shadow-2xl p-6 pt-3 pb-3 border border-[#444] backdrop-blur-md z-[9999]"
      {...animationProps}
    >
      <CalculatorHeader
        onReset={onReset}
        onCopy={handleCopyTotal}
        onRemove={onRemove}
        hasHistory={history.length > 0}
      />
      
      <OperationBar
        operations={OPERATIONS}
        currentOperation={currentOperation}
        onOperationClick={handleOperationClick}
      />
      
      <HistoryList
        history={history}
        onDelete={onDeleteHistoryItem}
        onEdit={onEditHistoryItem}
      />
      
      <div className="border-t border-[#444] mb-[13px]" />
      
      <TotalDisplay
        total={total}
        totalFontSize={totalFontSize}
        isTotalTooLarge={isTotalTooLarge}
      />
      
      {/* Shortcut Tip Footer - only show when no history */}
      {history.length === 0 && (
        <div className="text-[#10b981] text-[13px] text-center opacity-80 mt-2 mb-1 flex flex-row items-center justify-center gap-2 select-none">
          <span role="img" aria-label="sparkles">✨</span>
          <span className="font-mono">Double-click a number!</span>
        </div>
      )}
      
      {/* Shortcuts Marquee*/}
      <ShortcutsMarquee isVisible={isVisible} />
    </motion.div>
  );
});