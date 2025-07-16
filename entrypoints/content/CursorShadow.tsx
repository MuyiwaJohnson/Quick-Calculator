import { motion, MotionValue } from 'motion/react';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  formatLargeNumber,
  isNumberTooLarge,
  getNumberFontSize,
} from '../popup/utils/utils';
import {
  exportToCSV,
  exportToJSON,
  downloadFile,
  generateFilename,
  formatHistoryForExport,
} from '../popup/utils/export';
import type { CalculatorOperation } from '../popup/types';

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

export const CursorShadow: React.FC<Props> = React.memo(
  ({
    x,
    y,
    total = 0,
    history = [],
    isVisible = false,
    onOperation,
    currentOperation = '+',
    onCopy,
    followCursor = true,
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
        { symbol: '+', label: 'Add', color: '#22c55e' },
        { symbol: '-', label: 'Subtract', color: '#ef4444' },
        { symbol: '×', label: 'Multiply', color: '#3b82f6' },
        { symbol: '÷', label: 'Divide', color: '#a21caf' },
        { symbol: '%', label: 'Percentage', color: '#f59e42' },
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
      window.addEventListener('resize', throttledUpdate);
      return () => {
        window.removeEventListener('resize', throttledUpdate);
        clearTimeout(timeoutId);
      };
    }, []);
    function isMotionValue(val: any): val is MotionValue<number> {
      return val && typeof val.on === 'function' && typeof val.get === 'function';
    }
    useEffect(() => {
      if (!followCursor) return;
      if (!isMotionValue(x) || !isMotionValue(y)) {
        console.error('x or y is not a MotionValue', x, y);
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
      const unsubscribeX = x.on('change', updatePosition);
      const unsubscribeY = y.on('change', updatePosition);
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
    const handleCopyHistory = useCallback(() => {
      if (history.length === 0) return;
      const historyText = history
        .map(
          (item, index) =>
            `${index + 1}. ${item.operation}${item.value.toLocaleString()}`
        )
        .join('\n');
      const fullText = `Calculator History:\n${historyText}\n\nTotal: ${total.toLocaleString()}`;
      onCopy?.(fullText);
    }, [history, total, onCopy]);
    const handleExportCSV = useCallback(() => {
      if (history.length === 0) return;
      const exportData = formatHistoryForExport(history, total, '');
      const csvContent = exportToCSV(exportData);
      const filename = generateFilename('calculator_history', 'csv');
      downloadFile(csvContent, filename, 'text/csv');
    }, [history, total]);
    const handleExportJSON = useCallback(() => {
      if (history.length === 0) return;
      const exportData = formatHistoryForExport(history, total, '');
      const jsonContent = exportToJSON(exportData);
      const filename = generateFilename('calculator_history', 'json');
      downloadFile(jsonContent, filename, 'application/json');
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
          position: 'fixed' as const,
          zIndex: 9999,
        }
      : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          position: 'fixed' as const,
          zIndex: 9999,
        };
    return (
      <motion.div
        style={{
          ...fixedStyle,
          minWidth: 260,
          maxWidth: 360,
          minHeight: 320,
          maxHeight: 420,
          background: 'rgba(20,20,20,0.98)',
          color: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          padding: 20,
          border: '1px solid #444',
          backdropFilter: 'blur(8px)',
        }}
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
            type: 'spring',
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
          type: 'spring',
          stiffness: 300,
          damping: 25,
          mass: 0.8,
        }}
      >
        {/* Calculator Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: '#aaa', fontFamily: 'monospace' }}>CALCULATOR</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
            <motion.button onClick={handleCopyTotal} title="Copy total" style={{ background: 'none', border: '1px solid #444', borderRadius: 6, color: '#aaa', width: 22, height: 22, cursor: 'pointer', marginLeft: 4 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              ⧉
            </motion.button>
            {history.length > 0 && (
              <motion.button onClick={handleCopyHistory} title="Copy history" style={{ background: 'none', border: '1px solid #444', borderRadius: 6, color: '#aaa', width: 22, height: 22, cursor: 'pointer', marginLeft: 4 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                📝
              </motion.button>
            )}
            {history.length > 0 && (
              <motion.button onClick={handleExportCSV} title="Export to CSV" style={{ background: 'none', border: '1px solid #444', borderRadius: 6, color: '#aaa', width: 22, height: 22, cursor: 'pointer', marginLeft: 4 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                CSV
              </motion.button>
            )}
            {history.length > 0 && (
              <motion.button onClick={handleExportJSON} title="Export to JSON" style={{ background: 'none', border: '1px solid #444', borderRadius: 6, color: '#aaa', width: 22, height: 22, cursor: 'pointer', marginLeft: 4 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                JSON
              </motion.button>
            )}
          </div>
        </div>
        {/* Operation Buttons */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {operations.map((op) => (
            <motion.button
              key={op.symbol}
              onClick={() => handleOperationClick(op.symbol as CalculatorOperation)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                fontWeight: 'bold',
                fontSize: 16,
                color: '#fff',
                background: currentOperation === op.symbol ? op.color : '#222',
                border: currentOperation === op.symbol ? '2px solid #fff' : '1px solid #444',
                boxShadow: currentOperation === op.symbol ? '0 2px 8px rgba(0,0,0,0.18)' : undefined,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              title={op.label}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {op.symbol}
            </motion.button>
          ))}
        </div>
        {/* Current Operation Display */}
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 8, fontFamily: 'monospace' }}>
          Mode: {currentOperation} {currentOperation === '+' && '(Add)'}
          {currentOperation === '-' && '(Subtract)'}
          {currentOperation === '×' && '(Multiply)'}
          {currentOperation === '÷' && '(Divide)'}
        </div>
        {/* Numbers History */}
        <div style={{ marginBottom: 12, maxHeight: 80, overflowY: 'auto' }}>
          {history.length === 0 ? (
            <div style={{ color: '#888', fontSize: 13, fontStyle: 'italic' }}>
              No numbers added yet
            </div>
          ) : (
            history.map((item, index) => (
              <motion.div
                key={index}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '2px 0' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span style={{ color: '#bbb', fontFamily: 'monospace' }}>#{index + 1}</span>
                <span style={{ color: opColor(item.operation), fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${item.operation}${item.value.toLocaleString()}`}>
                  {item.operation}{item.value.toLocaleString()}
                </span>
              </motion.div>
            ))
          )}
        </div>
        <div style={{ borderTop: '1px solid #444', marginBottom: 8 }}></div>
        {/* Total Result */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', gap: 8, width: '100%' }}>
          <span style={{ color: '#aaa', fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>TOTAL</span>
          <motion.span
            style={{
              fontWeight: 'bold',
              fontFamily: 'monospace',
              fontSize: totalFontSize,
              color: '#fff',
              wordBreak: 'break-all',
              overflowX: 'auto',
              textAlign: 'right',
              padding: '0 4px',
              maxWidth: 180,
            }}
            initial={{ scale: 1.2, color: '#10b981' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
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
        <div style={{ color: '#888', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
          {history.length} item{history.length !== 1 ? 's' : ''} added
        </div>
      </motion.div>
    );
  }
);

function opColor(op: string) {
  switch (op) {
    case '+': return '#22c55e';
    case '-': return '#ef4444';
    case '×': return '#3b82f6';
    case '÷': return '#a21caf';
    case '%': return '#f59e42';
    default: return '#fff';
  }
} 