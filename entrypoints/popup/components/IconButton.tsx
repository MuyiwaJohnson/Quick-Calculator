import { motion } from "motion/react";
import React from "react";

interface IconButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  size?: "large" | "default";
}

export const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  title,
  children,
  size = "default",
}) => {
  const base =
    "flex items-center justify-center cursor-pointer p-0 ml-0 bg-none border border-[#444] rounded-md text-[#aaa] transition-all duration-150";
  const sizeClass =
    size === "large"
      ? "w-[28px] h-[28px] text-[20.5px] ml-[5px] border-none opacity-70 hover:opacity-100"
      : "w-[22.5px] h-[22.5px] text-[16px]";
  return (
    <motion.button
      onClick={onClick}
      title={title}
      className={`${base} ${sizeClass}`}
      style={size === "large" ? { outline: "none" } : undefined}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}; 