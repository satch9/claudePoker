import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  padding = "md",
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -2, scale: 1.01 } : undefined}
      className={cn(
        "bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl",
        paddingClasses[padding],
        hoverable && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
