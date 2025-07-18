import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useCalculator } from "../hooks/use-calculator";
import { useToast, ToastContainer } from "../hooks/use-toast";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { CursorShadow } from "./CursorShadow";
import { opColor } from "../utils/utils";

interface ContentCalculatorUIProps {
  onRemove?: () => void;
}

// center of the screen
const initialPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

const ContentCalculatorUI: React.FC<ContentCalculatorUIProps> = ({
  onRemove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [followMouse, setFollowMouse] = useState(false);
  const [mousePosition, setMousePosition] = useState(initialPosition);

  // Calculator state
  const {
    total,
    history,
    currentOperation,
    addNumber,
    setOperation,
    reset,
    undo,
    copyTotal,
    isCalculatorVisible,
    setVisibility,
    deleteHistoryItem,
    editHistoryItem,
  } = useCalculator();

  // Set calculator visible when UI is mounted
  useEffect(() => {
    setVisibility(true);
  }, [setVisibility]);

  const { toasts, showToast, removeToast } = useToast();

  // Motion values for position
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });


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
    window.addEventListener("mousePositionUpdate", handleMouseMove);
    return () => {
      window.removeEventListener("mousePositionUpdate", handleMouseMove);
    };
  }, [followMouse, isDragging, x, y]);

  // Double-click number capture (only when visible)
  useEffect(() => {
    const handleNumberDoubleClick = (e: any) => {
      const { number, position } = e.detail;
      addNumber(number);
      showNumberAddedFeedback(position, number);
      showToast(`Added ${number}`, "success");
    };
    window.addEventListener("numberDoubleClick", handleNumberDoubleClick);
    return () => {
      window.removeEventListener("numberDoubleClick", handleNumberDoubleClick);
    };
  }, [addNumber, showToast]);

  // Show visual feedback when number is added
  const showNumberAddedFeedback = (position: any, number: any) => {
    const feedback = document.createElement("div");
    feedback.textContent = `+${number}`;
    feedback.style.position = "fixed";
    feedback.style.left = `${position.x}px`;
    feedback.style.top = `${position.y}px`;
    feedback.style.color = opColor(currentOperation);
    feedback.style.fontWeight = "bold";
    feedback.style.fontSize = "14px";
    feedback.style.pointerEvents = "none";
    feedback.style.zIndex = "10001";
    feedback.style.animation = "fadeUpAndOut 1s ease-out forwards";
    if (!document.getElementById("number-feedback-styles")) {
      const style = document.createElement("style");
      style.id = "number-feedback-styles";
      style.textContent = `@keyframes fadeUpAndOut {0% { opacity: 1; transform: translateY(0); }100% { opacity: 0; transform: translateY(-20px); }}`;
      document.head.appendChild(style);
    }
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 1000);
  };

  // Keyboard shortcuts (only when visible)
  useKeyboardShortcuts({
    onUndo: undo,
    onReset: reset,
    isEnabled: isCalculatorVisible,
  });

  return (
    <>
      <motion.div
        drag={!followMouse}
        dragMomentum={false}
        style={{ x, y, position: "fixed", zIndex: 10000 }}
        id="calculator-ui"
        className="rounded-2xl shadow-2xl border border-[#444] bg-[rgba(20,20,20,0.98)]"
      >
        <CursorShadow
          x={followMouse ? springX : x}
          y={followMouse ? springY : y}
          total={total}
          history={history}
          isVisible={isCalculatorVisible}
          onOperation={setOperation}
          currentOperation={currentOperation}
          onCopy={copyTotal}
          followCursor={followMouse}
          onRemove={onRemove}
          onReset={reset}
          onDeleteHistoryItem={deleteHistoryItem}
          onEditHistoryItem={editHistoryItem}
        />
      </motion.div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default ContentCalculatorUI;
