import { motion } from "motion/react";
import React from "react";

interface IconButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  size?: "large" | "default";
  color?: "red" | "default";
}

export const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  title,
  children,
  size = "default",
  color = "default",
}) => {
  const base =
    "flex items-center justify-center cursor-pointer p-0 ml-0 bg-none border rounded-md transition-all duration-150";
  const sizeClass =
    size === "large"
      ? "w-[28px] h-[28px] text-[20.5px] ml-[5px] border-none opacity-70 hover:opacity-100"
      : "w-[22.5px] h-[22.5px] text-[16px]";
  const colorClass =
    color === "red"
      ? "text-red-500 border-red-500 hover:bg-red-50/10"
      : "text-[#aaa] border-[#444]";
  return (
    <motion.button
      onClick={onClick}
      title={title}
      className={`${base} ${sizeClass} ${colorClass}`}
      style={size === "large" ? { outline: "none" } : undefined}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}; 