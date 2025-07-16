import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { X, Move, Minimize2, Maximize2, MousePointer, Calculator } from 'lucide-react';
import { useCalculator } from '../hooks/use-calculator';
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts';
import { useToast, ToastContainer } from '../hooks/use-toast';
import type { CalculatorOperation } from '../types';
import { CursorShadow } from './CursorShadow';

interface ContentCalculatorUIProps {
  initialPosition?: { x: number; y: number };
  onClose: () => void;
  onRemove?: () => void;
}

const ContentCalculatorUI: React.FC<ContentCalculatorUIProps> = ({
  initialPosition = { x: 100, y: 100 },
  onClose,
  onRemove,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [followMouse, setFollowMouse] = useState(false);
  const [mousePosition, setMousePosition] = useState(initialPosition);
  const constraintsRef = React.useRef(null);

  // Calculator state
  const {
    total,
    history,
    currentOperation,
    addNumber,
    setOperation,
    reset,
    undo,
    show,
    hide,
    copyTotal,
    exportToCSV,
    exportToJSON,
  } = useCalculator();

  const { toasts, showToast, removeToast } = useToast();

  // Motion values for position
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  const scale = useTransform([x, y], ([latestX, latestY]) => (isDragging ? 1.05 : 1));

  // Mouse position tracking from extension events
  useEffect(() => {
    const handleMouseMove = (e: any) => {
      const newPosition = { x: e.detail.x, y: e.detail.y };
      setMousePosition(newPosition);
      if (followMouse && !isDragging) {
        x.set(newPosition.x + 20);
        y.set(newPosition.y + 20);
      }
    };
    window.addEventListener('mousePositionUpdate', handleMouseMove);
    return () => {
      window.removeEventListener('mousePositionUpdate', handleMouseMove);
    };
  }, [followMouse, isDragging, x, y]);

  // Double-click number capture (only when visible)
  useEffect(() => {
    const handleNumberDoubleClick = (e: any) => {
      const { number, position } = e.detail;
      addNumber(number);
      showNumberAddedFeedback(position, number);
      showToast(`Added ${number}`, 'success');
    };
    window.addEventListener('numberDoubleClick', handleNumberDoubleClick);
    return () => {
      window.removeEventListener('numberDoubleClick', handleNumberDoubleClick);
    };
  }, [addNumber, showToast]);

  // Show visual feedback when number is added
  const showNumberAddedFeedback = (position: any, number: any) => {
    const feedback = document.createElement('div');
    feedback.textContent = `+${number}`;
    feedback.style.position = 'fixed';
    feedback.style.left = `${position.x}px`;
    feedback.style.top = `${position.y}px`;
    feedback.style.color = '#10b981';
    feedback.style.fontWeight = 'bold';
    feedback.style.fontSize = '14px';
    feedback.style.pointerEvents = 'none';
    feedback.style.zIndex = '10001';
    feedback.style.animation = 'fadeUpAndOut 1s ease-out forwards';
    if (!document.getElementById('number-feedback-styles')) {
      const style = document.createElement('style');
      style.id = 'number-feedback-styles';
      style.textContent = `@keyframes fadeUpAndOut {0% { opacity: 1; transform: translateY(0); }100% { opacity: 0; transform: translateY(-20px); }}`;
      document.head.appendChild(style);
    }
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 1000);
  };

  // Keyboard shortcuts (only when visible)
  useKeyboardShortcuts({
    onEscape: onClose,
    onUndo: undo,
    onReset: reset,
    isEnabled: true,
    showToast,
    onShortcutPress: (shortcut) => {},
    onOperationChange: (op) => setOperation(op as CalculatorOperation),
    onCopyTotal: copyTotal,
    onShowCalculator: show,
    onExportCSV: exportToCSV,
    onExportJSON: exportToJSON,
    onToggleFollowCursor: () => setFollowMouse(f => !f),
  });

  const handleDragStart = () => {
    setIsDragging(true);
    setFollowMouse(false);
  };
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  const toggleFollowMouse = () => {
    setFollowMouse(f => {
      if (!f) {
        x.set(mousePosition.x + 20);
        y.set(mousePosition.y + 20);
      }
      return !f;
    });
  };

  return (
    <>
      <motion.div
        drag={!followMouse}
        dragMomentum={false}
        style={{ x, y, position: 'fixed', zIndex: 10000 }}
      >
        <CursorShadow
          x={followMouse ? springX : x}
          y={followMouse ? springY : y}
          total={total}
          history={history}
          isVisible={true}
          onOperation={setOperation}
          currentOperation={currentOperation}
          onCopy={copyTotal}
          followCursor={followMouse}
          onRemove={onRemove}
        />
      </motion.div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default ContentCalculatorUI; 