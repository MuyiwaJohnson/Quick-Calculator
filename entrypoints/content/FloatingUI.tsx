import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import {
  X,
  Move,
  Minimize2,
  Maximize2,
  MousePointer,
  Calculator,
} from "lucide-react";

interface FloatingUIProps {
  initialPosition?: { x: number; y: number };
  onClose: () => void;
}

const FloatingUI: React.FC<FloatingUIProps> = ({
  initialPosition = { x: 100, y: 100 },
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [followMouse, setFollowMouse] = useState(false);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [mousePosition, setMousePosition] = useState(initialPosition);
  const constraintsRef = useRef(null);

  // Motion values for position
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);

  // Spring animation for smooth mouse following
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  // Transform for visual feedback during drag
  const scale = useTransform([x, y], ([latestX, latestY]) =>
    isDragging ? 1.05 : 1
  );

  // Mouse position tracking
  useEffect(() => {
    const handleMouseMove = (e: any) => {
      const newPosition = { x: e.detail.x, y: e.detail.y };
      setMousePosition(newPosition);

      if (followMouse && !isDragging) {
        // Offset the UI so it doesn't cover the cursor
        x.set(newPosition.x + 20);
        y.set(newPosition.y + 20);
      }
    };

    const handleNumberDoubleClick = (e: any) => {
      const { number, position } = e.detail;
      addNumber(number);

      // Brief highlight animation at click position
      showNumberAddedFeedback(position, number);
    };

    window.addEventListener("mousePositionUpdate", handleMouseMove);
    window.addEventListener("numberDoubleClick", handleNumberDoubleClick);

    return () => {
      window.removeEventListener("mousePositionUpdate", handleMouseMove);
      window.removeEventListener("numberDoubleClick", handleNumberDoubleClick);
    };
  }, [followMouse, isDragging, x, y]);

  // Add number to the list and update total
  const addNumber = (number: any) => {
    const newNumbers = [...numbers, number];
    setNumbers(newNumbers);
    setTotal(newNumbers.reduce((sum, num) => sum + num, 0));
  };

  // Clear all numbers
  const clearNumbers = () => {
    setNumbers([]);
    setTotal(0);
  };

  // Show visual feedback when number is added
  const showNumberAddedFeedback = (position: any, number: any) => {
    const feedback = document.createElement("div");
    feedback.textContent = `+${number}`;
    feedback.style.position = "fixed";
    feedback.style.left = `${position.x}px`;
    feedback.style.top = `${position.y}px`;
    feedback.style.color = "#10b981";
    feedback.style.fontWeight = "bold";
    feedback.style.fontSize = "14px";
    feedback.style.pointerEvents = "none";
    feedback.style.zIndex = "10001";
    feedback.style.animation = "fadeUpAndOut 1s ease-out forwards";

    // Add CSS animation
    if (!document.getElementById("number-feedback-styles")) {
      const style = document.createElement("style");
      style.id = "number-feedback-styles";
      style.textContent = `
        @keyframes fadeUpAndOut {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 1000);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    setFollowMouse(false); // Stop following mouse when dragging
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const toggleFollowMouse = () => {
    setFollowMouse(!followMouse);
    if (!followMouse) {
      // Start following mouse immediately
      x.set(mousePosition.x + 20);
      y.set(mousePosition.y + 20);
    }
  };

  return (
    <div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 10000 }}
    >
      <motion.div
        drag={!followMouse}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{
          x: followMouse ? springX : x,
          y: followMouse ? springY : y,
          scale,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="pointer-events-auto absolute"
      >
        <div
          className={`bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
            isMinimized ? "w-48 h-12" : "w-80 h-96"
          }`}
        >
          {/* Header with drag handle */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-move">
            <div className="flex items-center gap-2">
              <Move size={16} className="text-white/80" />
              <span className="font-medium text-sm">Calculator UI</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleFollowMouse}
                className={`p-1 rounded transition-colors ${
                  followMouse ? "bg-white/30" : "hover:bg-white/20"
                }`}
                title={followMouse ? "Stop following mouse" : "Follow mouse"}
              >
                <MousePointer size={14} />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 size={14} />
                ) : (
                  <Minimize2 size={14} />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 h-full overflow-y-auto"
            >
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      followMouse ? "bg-green-500 animate-pulse" : "bg-blue-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {followMouse ? "Following mouse" : "Draggable mode"}
                  </span>
                </div>

                {/* Calculator Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calculator size={16} className="text-gray-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Number Calculator
                    </label>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800 mb-2">
                      Total: {total.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Double-click any number on the page to add it
                    </div>
                  </div>

                  {/* Numbers List */}
                  {numbers.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Added Numbers ({numbers.length})
                        </span>
                        <button
                          onClick={clearNumbers}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="max-h-24 overflow-y-auto bg-white border rounded p-2 space-y-1">
                        {numbers.map((number, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-xs"
                          >
                            <span>#{index + 1}</span>
                            <span className="font-mono">{number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Controls
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={followMouse}
                        onChange={toggleFollowMouse}
                        className="rounded"
                      />
                      Follow mouse cursor
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {followMouse
                        ? "Following cursor"
                        : isDragging
                        ? "Dragging..."
                        : "Ready"}
                    </span>
                    <span>
                      x: {Math.round(mousePosition.x)}, y:{" "}
                      {Math.round(mousePosition.y)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FloatingUI;
