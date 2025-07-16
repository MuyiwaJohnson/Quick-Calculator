import { motion, MotionValue } from "motion/react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  formatLargeNumber,
  isNumberTooLarge,
  getNumberFontSize,
} from "../utils/utils";
import {
  exportToCSV,
  downloadFile,
  generateFilename,
  formatHistoryForExport,
} from "../utils/export";
import type { CalculatorOperation } from "../types";

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
      function isMotionValue(val: any): val is MotionValue<number> {
        return (
          val && typeof val.on === "function" && typeof val.get === "function"
        );
      }
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

      const formattedTotal = useMemo(() => total.toLocaleString(), [total]);

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
          {/* Calculator Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-[9px] min-w-0">
              {/* Draggable Icon */}
              <span
                title="Drag"
                className="inline-flex items-center text-[18px] text-[#666] opacity-70 cursor-grab select-none flex-shrink-0"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="5" cy="5" r="1.2" fill="#888" />
                  <circle cx="5" cy="9" r="1.2" fill="#888" />
                  <circle cx="5" cy="13" r="1.2" fill="#888" />
                  <circle cx="9" cy="5" r="1.2" fill="#888" />
                  <circle cx="9" cy="9" r="1.2" fill="#888" />
                  <circle cx="9" cy="13" r="1.2" fill="#888" />
                </svg>
              </span>
              <span className="text-[15px] text-[#aaa] font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                CALCULATOR
              </span>
            </div>
            {/* Actions: Export CSV, Copy, Close */}
            <div className="flex items-center gap-[5px] flex-shrink-0">
              {/* Export CSV Button */}
              {history.length > 0 && (
                <motion.button
                  onClick={handleExportCSV}
                  title="Export to CSV"
                  className="bg-none border border-[#444] rounded-md text-[#aaa] w-[22.5px] h-[22.5px] cursor-pointer ml-0 flex items-center justify-center p-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span role="img" aria-label="CSV">
                    📄
                  </span>
                </motion.button>
              )}
              {/* Copy Total Button */}
              <motion.button
                onClick={handleCopyTotal}
                title="Copy total"
                className="bg-none border border-[#444] rounded-md text-[#aaa] w-[22.5px] h-[22.5px] cursor-pointer ml-0 flex items-center justify-center p-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span role="img" aria-label="Copy">
                  ⧉
                </span>
              </motion.button>
              {/* Remove/Close Button */}
              {onRemove && (
                <button
                  onClick={onRemove}
                  title="Close calculator"
                  className="bg-none border-none text-[#aaa] text-[20.5px] cursor-pointer ml-[5px] p-0 flex items-center opacity-70 transition-opacity duration-150 hover:opacity-100"
                  style={{ outline: "none" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="4"
                      y1="4"
                      x2="14"
                      y2="14"
                      stroke="#aaa"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="14"
                      y1="4"
                      x2="4"
                      y2="14"
                      stroke="#aaa"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Operation Buttons */}
          <div className="flex gap-2 mb-[19px] mt-[13px]">
            {operations.map((op) => (
              <motion.button
                key={op.symbol}
                onClick={() =>
                  handleOperationClick(op.symbol as CalculatorOperation)
                }
                className={`w-[22.5px] h-[22.5px] rounded-md font-semibold text-[13.5px] text-white border transition-all duration-150 cursor-pointer ${
                  currentOperation === op.symbol
                    ? "border-white shadow-md"
                    : "border-[#444]"
                } ${currentOperation === op.symbol ? "" : "bg-[#222]"}`}
                style={{
                  background:
                    currentOperation === op.symbol ? op.color : undefined,
                }}
                title={op.label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {op.symbol}
              </motion.button>
            ))}
          </div>

          {/* Numbers History */}
          <div className="scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-transparent mb-[13px] max-h-[81px] overflow-y-auto overflow-x-hidden">
            {history.length === 0 ? (
              <div className="text-[#8888] text-[13px] italic">
                No numbers added yet
              </div>
            ) : (
              history.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex justify-between items-center text-[14.5px] py-0.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-[#bbb] font-mono">#{index + 1}</span>
                  <span
                    className="font-mono max-w-[121px] overflow-hidden text-ellipsis text-[15.5px]"
                    style={{ color: opColor(item.operation) }}
                    title={`${item.operation}${item.value.toLocaleString()}`}
                  >
                    {item.operation}
                    {item.value.toLocaleString()}
                  </span>
                </motion.div>
              ))
            )}
          </div>

          {/* Divider Line */}
          <div className="border-t border-[#444] mb-[13px]"></div>

          {/* Total Result */}
          <div className="flex flex-row items-center justify-between py-[9px] gap-[9px] w-full text-[16.5px]">
            <span className="text-[#aaa] text-[16.5px] font-medium whitespace-nowrap flex-shrink-0">
              TOTAL
            </span>
            <motion.span
              className="font-bold font-mono text-white break-all overflow-x-auto text-right px-[5px] max-w-[181px]"
              style={{ fontSize: totalFontSize + 1.5 }}
              initial={{ scale: 1.2, color: "#10b981" }}
              animate={{ scale: 1, color: "#ffffff" }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              title={
                isTotalTooLarge
                  ? `${total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} (exp: ${total.toExponential(2)})`
                  : `${total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
              }
            >
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </motion.span>
          </div>

          {/* Item Count */}
          <div className="text-[#888] text-[13.5px] mt-[9px] text-center">
            {history.length} item{history.length !== 1 ? "s" : ""} added
          </div>
          {/* Shortcut Tip Footer */}
          {history.length === 0 && (
            <div className="text-[#aaa] text-[12.5px] text-center opacity-70 mt-[19px] mb-1 flex flex-row items-center justify-center gap-[5px]">
              <kbd className="bg-[#222] text-[#eee] rounded px-[7px] py-[3px] text-[11.5px] font-inherit border border-[#444] mr-[3px] shadow-sm">
                Ctrl
              </kbd>
              <span className="text-[11.5px] text-[#888]">+</span>
              <kbd className="bg-[#222] text-[#eee] rounded px-[7px] py-[3px] text-[11.5px] font-inherit border border-[#444] mr-[3px] shadow-sm">
                Shift
              </kbd>
              <span className="text-[11.5px] text-[#888]">+</span>
              <kbd className="bg-[#222] text-[#eee] rounded px-[7px] py-[3px] text-[11.5px] font-inherit border border-[#444] shadow-sm">
                C
              </kbd>
              <span className="text-[11.5px] text-[#888] ml-[5px]">
                to open
              </span>
            </div>
          )}
        </motion.div>
      );
    }
  );
function opColor(op: string) {
  switch (op) {
    case "+":
      return "#22c55e";
    case "-":
      return "#ef4444";
    case "×":
      return "#3b82f6";
    case "÷":
      return "#a21caf";
    case "%":
      return "#f59e42";
    default:
      return "#fff";
  }
}
