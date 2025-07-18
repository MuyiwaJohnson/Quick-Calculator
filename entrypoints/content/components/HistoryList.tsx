import React, { useRef, useEffect } from "react";
import { HistoryItem } from "./HistoryItem";
import { AnimatePresence, motion } from "motion/react";

interface HistoryListProps {
  history: Array<{ value: number; operation: string; timestamp?: number }>;
  onDelete?: (index: number) => void;
  onEdit?: (index: number, newValue: number) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ 
  history, 
  onDelete, 
  onEdit 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history.length]);

  return (
    <div
      ref={containerRef}
      className="scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-transparent mb-[13px] max-h-[120px] overflow-y-auto overflow-x-hidden"
    >
      {history.length === 0 ? (
        <div className="text-[#8888] text-[13px] italic">
          No numbers added yet
        </div>
      ) : (
        <AnimatePresence initial={true}>
          {history.map((item, index) => (
            <motion.div
              key={item.timestamp ?? `${item.value}-${item.operation}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{
                duration: 0.18,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              <HistoryItem
                operation={item.operation}
                value={item.value}
                index={index}
                timestamp={item.timestamp}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};
