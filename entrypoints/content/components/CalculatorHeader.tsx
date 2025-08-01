import React from "react";
import { IconButton } from "./IconButton";
import { Copy, Trash2, X } from "lucide-react";


interface CalculatorHeaderProps {
  onReset: () => void;
  onCopy: () => void;
  onRemove?: () => void;
  hasHistory: boolean;
}

export const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({
  onReset,
  onCopy,
  onRemove,
  hasHistory,
}) => (
  <div className="flex items-center justify-between mb-[10px]">
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
    <div className="flex items-center gap-[10px] flex-shrink-0">
      {hasHistory && (
        <IconButton onClick={onReset} title="Reset" color="red">
          <Trash2 size={13} color="#ef4444" />
        </IconButton>
      )}
      <IconButton onClick={onCopy} title="Copy total">
        <Copy size={13} />
      </IconButton>
      {onRemove && (
        <IconButton onClick={onRemove} title="Close calculator" size="large" color="red">
          <X size={15} />
        </IconButton>
      )}
    </div>
  </div>
); 