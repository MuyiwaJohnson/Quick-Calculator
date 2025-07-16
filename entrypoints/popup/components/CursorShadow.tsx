import { motion, MotionValue } from "motion/react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  formatLargeNumber,
  isNumberTooLarge,
  getNumberFontSize,
  opColor,
  isMotionValue,
} from "../utils/utils";
import {
  exportToCSV,
  downloadFile,
  generateFilename,
  formatHistoryForExport,
} from "../utils/export";
import type { CalculatorOperation } from "../types";
import { CalculatorHeader } from "./CalculatorHeader";
import { OperationBar } from "./OperationBar";
import { HistoryList } from "./HistoryList";
import { TotalDisplay } from "./TotalDisplay";

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
}

export const CursorShadow: React.FC<Props & { onRemove?: () => void }> =
  React.memo(
    ({
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
    }) => {
      const [position, setPosition] = useState({
        top: 0,
        left: 0,
        flipUp: false,
      });
      const [windowDimensions, setWindowDimensions] = useState({
        width: 0,
        height: 0,
      });
      const operations = useMemo(
        () => [
          { symbol: "+", label: "Add", color: "#22c55e" },
          { symbol: "-", label: "Subtract", color: "#ef4444" },
          { symbol: "×", label: "Multiply", color: "#3b82f6" },
          { symbol: "÷", label: "Divide", color: "#a21caf" },
          { symbol: "%", label: "Percentage", color: "#f59e42" },
        ],
        []
      );
      useEffect(() => {
        let timeoutId: any;
        const updateDimensions = () => {
          setWindowDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        };
        const throttledUpdate = () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(updateDimensions, 100);
        };
        updateDimensions();
        window.addEventListener("resize", throttledUpdate);
        return () => {
          window.removeEventListener("resize", throttledUpdate);
          clearTimeout(timeoutId);
        };
      }, []);
      useEffect(() => {
        if (!followCursor) return;
        if (!isMotionValue(x) || !isMotionValue(y)) {
          console.error("x or y is not a MotionValue", x, y);
          return;
        }
        const updatePosition = () => {
          if (!isVisible) return;
          const cursorX = x.get();
          const cursorY = y.get();
          const calculatorHeight = 320;
          const calculatorWidth = 360;
          const margin = 20;
          const offset = 50;
          let newTop = cursorY + offset;
          let newLeft = cursorX + offset;
          let flipUp = false;
          if (
            cursorY + offset + calculatorHeight + margin >
            windowDimensions.height
          ) {
            flipUp = true;
            newTop = cursorY - calculatorHeight - offset;
          }
          if (newTop < margin) newTop = margin;
          if (newTop + calculatorHeight + margin > windowDimensions.height)
            newTop = windowDimensions.height - calculatorHeight - margin;
          if (newLeft + calculatorWidth + margin > windowDimensions.width)
            newLeft = windowDimensions.width - calculatorWidth - margin;
          if (newLeft < margin) newLeft = margin;
          setPosition({ top: newTop, left: newLeft, flipUp });
        };
        const unsubscribeX = x.on("change", updatePosition);
        const unsubscribeY = y.on("change", updatePosition);
        updatePosition();
        return () => {
          unsubscribeX();
          unsubscribeY();
        };
      }, [x, y, isVisible, windowDimensions, followCursor]);

      const handleCopyTotal = useCallback(() => {
        const text = `${total.toLocaleString()}`;
        onCopy?.(text);
      }, [total, onCopy]);

      const handleExportCSV = useCallback(() => {
        if (history.length === 0) return;
        const exportData = formatHistoryForExport(history, total, "");
        const csvContent = exportToCSV(exportData);
        const filename = generateFilename("calculator_history", "csv");
        downloadFile(csvContent, filename, "text/csv");
      }, [history, total]);

      const handleOperationClick = useCallback(
        (symbol: CalculatorOperation) => {
          onOperation?.(symbol);
        },
        [onOperation]
      );

      const totalFontSize = useMemo(() => {
        const abs = Math.abs(total);
        if (abs >= 1e12) return 16;
        if (abs >= 1e9) return 20;
        return 24;
      }, [total]);

      const isTotalTooLarge = useMemo(() => isNumberTooLarge(total), [total]);
      if (!isVisible) return null;

      const fixedStyle = followCursor
        ? {
            top: position.top,
            left: position.left,
            position: "fixed" as const,
            zIndex: 9999,
          }
        : {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            position: "fixed" as const,
            zIndex: 9999,
          };
      return (
        <motion.div
          style={fixedStyle}
          className="min-w-[288px] max-w-[360px] min-h-[276px] max-h-[346px] bg-[rgba(20,20,20,0.98)] text-white rounded-2xl shadow-2xl p-6 border border-[#444] backdrop-blur-md z-[9999]"
          initial={{
            opacity: 0,
            scale: 0.8,
            y: position.flipUp ? 10 : -10,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 25,
              mass: 0.8,
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            y: position.flipUp ? 10 : -10,
          }}
          whileHover={{ scale: 1.02 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            mass: 0.8,
          }}
        >
          <CalculatorHeader
            onExport={handleExportCSV}
            onCopy={handleCopyTotal}
            onRemove={onRemove}
            hasHistory={history.length > 0}
          />
          <OperationBar
            operations={operations}
            currentOperation={currentOperation}
            onOperationClick={handleOperationClick}
          />
          <HistoryList history={history} />
          <div className="border-t border-[#444] mb-[13px]"></div>
          <TotalDisplay
            total={total}
            totalFontSize={totalFontSize}
            isTotalTooLarge={isTotalTooLarge}
          />
          {/* Shortcut Tip Footer */}
          {history.length === 0 && (
            <div className="text-[#10b981] text-[13px] text-center opacity-80 mt-[19px] mb-1 flex flex-row items-center justify-center gap-2 select-none">
              <span role="img" aria-label="sparkles">✨</span>
              <span className="font-mono">Double-click a number!</span>
            </div>
          )}
        </motion.div>
      );
    }
  );
