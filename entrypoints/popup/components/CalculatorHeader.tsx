import React from "react";
import { IconButton } from "./IconButton";

interface CalculatorHeaderProps {
  onExport: () => void;
  onCopy: () => void;
  onRemove?: () => void;
  hasHistory: boolean;
}

export const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({
  onExport,
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
    <div className="flex items-center gap-[5px] flex-shrink-0">
      {hasHistory && (
        <IconButton onClick={onExport} title="Export to CSV">
          <span role="img" aria-label="CSV">📄</span>
        </IconButton>
      )}
      <IconButton onClick={onCopy} title="Copy total">
        <span role="img" aria-label="Copy">⧉</span>
      </IconButton>
      {onRemove && (
        <IconButton onClick={onRemove} title="Close calculator" size="large">
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
        </IconButton>
      )}
    </div>
  </div>
); 