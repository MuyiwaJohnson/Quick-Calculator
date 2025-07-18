import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { opColor } from "../utils/utils";

interface HistoryItemProps {
  operation: string;
  value: number;
  index: number;
  timestamp?: number;
  onDelete?: (index: number) => void;
  onEdit?: (index: number, newValue: number) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  operation,
  value,
  index,
  timestamp,
  onDelete,
  onEdit,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleEdit = () => {
    if (isEditing) {
      const newValue = parseFloat(editValue);
      if (!isNaN(newValue) && onEdit) {
        onEdit(index, newValue);
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setEditValue(value.toString());
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(index);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleEdit();
  };

  return (
    <motion.div
      className="flex justify-between items-center text-[14.5px] py-0.5 group relative"
      data-timestamp={timestamp ?? undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-[#bbb] font-mono">#{index + 1}</span>
      
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={() => {
              // Only save on blur if the value is different
              const newValue = parseFloat(editValue);
              if (!isNaN(newValue) && newValue !== value && onEdit) {
                onEdit(index, newValue);
              }
              setIsEditing(false);
            }}
            className="bg-transparent border border-[#444] rounded px-2 py-1 text-[15.5px] font-mono w-20 text-right focus:outline-none focus:border-[#666]"
            style={{ color: opColor(operation) }}
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : (
          <span
            className="font-mono max-w-[121px] overflow-hidden text-ellipsis text-[15.5px]"
            style={{ color: opColor(operation) }}
            title={`${operation}${value.toLocaleString()}`}
          >
            {operation}
            {value.toLocaleString()}
          </span>
        )}
        
        <AnimatePresence>
          {isHovered && !isEditing && (
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={handleEditClick}
                className="w-5 h-5 rounded-full bg-[#333] hover:bg-[#555] flex items-center justify-center transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Edit value"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </motion.button>
              
              <motion.button
                onClick={handleDelete}
                className="w-5 h-5 rounded-full bg-[#333] hover:bg-[#ef4444] flex items-center justify-center transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Delete item"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
