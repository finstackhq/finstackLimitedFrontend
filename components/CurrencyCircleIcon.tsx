import React from "react";
import { cn } from "@/lib/utils";

interface CurrencyCircleIconProps {
  code: string;
  className?: string;
  size?: number; // px
}

// Colors updated to match project: blue background, white text
const currencyColors: Record<string, { bg: string; text: string }> = {
  XAF: { bg: "bg-blue-600", text: "text-white" },
  XOF: { bg: "bg-blue-600", text: "text-white" },
};

export const CurrencyCircleIcon: React.FC<CurrencyCircleIconProps> = ({
  code,
  className = "",
  size = 48,
}) => {
  const colors = currencyColors[code] || {
    bg: "bg-gray-300",
    text: "text-gray-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold rounded-full",
        colors.bg,
        colors.text,
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {code}
    </span>
  );
};
