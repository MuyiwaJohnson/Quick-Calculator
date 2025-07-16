import React from "react";
import { opColor } from "../utils/utils";

interface HistoryItemProps {
  operation: string;
  value: number;
  index: number;
  timestamp?: number;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ operation, value, index, timestamp }) => (
  <div
    className="flex justify-between items-center text-[14.5px] py-0.5"
    data-timestamp={timestamp ?? undefined}
  >
    <span className="text-[#bbb] font-mono">#{index + 1}</span>
    <span
      className="font-mono max-w-[121px] overflow-hidden text-ellipsis text-[15.5px]"
      style={{ color: opColor(operation) }}
      title={`${operation}${value.toLocaleString()}`}
    >
      {operation}
      {value.toLocaleString()}
    </span>
  </div>
); 