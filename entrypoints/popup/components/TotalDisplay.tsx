import React from "react";
import { motion } from "motion/react";

interface TotalDisplayProps {
  total: number;
  totalFontSize: number;
  isTotalTooLarge: boolean;
}

export const TotalDisplay: React.FC<TotalDisplayProps> = ({ total, totalFontSize, isTotalTooLarge }) => (
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
); 