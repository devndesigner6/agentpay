import { useState, useEffect } from "react";
import { cn } from "../../utils/cn.js";

export interface DiaTextRevealProps {
  text: string | string[];
  colors?: string[];
  textColor?: string;
  duration?: number;
  delay?: number;
  repeat?: boolean;
  repeatDelay?: number;
  className?: string;
  fixedWidth?: boolean;
}

export function DiaTextReveal({
  text,
  colors = ["#0047ff", "#A97CF8", "#F38CB8", "#FDCC92", "#0047ff"],
  textColor = "var(--foreground, #111111)",
  duration = 1.5,
  delay = 0,
  repeat = false,
  repeatDelay = 1.2,
  className,
  fixedWidth = false
}: DiaTextRevealProps) {
  const textArray = Array.isArray(text) ? text : [text];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sweep, setSweep] = useState(false);

  const currentText = textArray[currentIndex];

  useEffect(() => {
    setSweep(true);
    const timer = setTimeout(() => {
      setSweep(false);
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [currentIndex, duration]);

  useEffect(() => {
    if (!repeat || textArray.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % textArray.length);
    }, (duration + repeatDelay) * 1000);

    return () => clearInterval(interval);
  }, [repeat, textArray.length, duration, repeatDelay]);

  return (
    <span
      className={cn("relative inline-block overflow-hidden align-bottom py-0.5", className)}
      style={{
        minWidth: fixedWidth ? "120px" : "auto"
      }}
    >
      {/* Sweeping color band overlay */}
      <span
        className={cn(
          "absolute top-0 bottom-0 left-0 w-full z-10 pointer-events-none transform -translate-x-full transition-transform",
          sweep ? "animate-sweep-band" : ""
        )}
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.join(", ")}, transparent)`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`
        }}
      />
      {/* Solid revealing text */}
      <span
        className="relative z-0"
        style={{
          color: textColor
        }}
      >
        {currentText}
      </span>
    </span>
  );
}
