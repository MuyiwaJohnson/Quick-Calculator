import { motion } from "motion/react";
import React from "react";

interface OperationButtonProps {
  symbol: string;
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

export const OperationButton: React.FC<OperationButtonProps> = ({
  symbol,
  label,
  color,
  isActive,
  onClick,
}) => (
  <motion.button
    onClick={onClick}
    className={`w-[22.5px] h-[22.5px] rounded-md font-semibold text-[13.5px] text-white border transition-all duration-150 cursor-pointer ${
      isActive ? "border-white shadow-md" : "border-[#444]"
    } ${isActive ? "" : "bg-[#222]"}`}
    style={{ background: isActive ? color : undefined }}
    title={label}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    {symbol}
  </motion.button>
); 