import React, { useState } from "react";
import { cn } from "../../utils/cn.js";

export interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export const RippleButton = React.forwardRef<
  HTMLButtonElement,
  RippleButtonProps
>(({ rippleColor = "rgba(255, 255, 255, 0.35)", className, children, onClick, ...props }, ref) => {
  const [rippleList, setRippleList] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };

    setRippleList((prev) => [...prev, newRipple]);
  };

  return (
    <button
      ref={ref}
      onClick={(e) => {
        createRipple(e);
        if (onClick) onClick(e);
      }}
      className={cn(
        "relative overflow-hidden cursor-pointer flex items-center justify-center rounded-lg px-6 py-3 font-semibold transition-all active:scale-[0.98] select-none border border-slate-200",
        className
      )}
      {...props}
    >
      {/* ripples */}
      {rippleList.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            position: "absolute",
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            borderRadius: "50%",
            backgroundColor: rippleColor,
            pointerEvents: "none",
            transform: "scale(0)",
            animation: "ripple-anim 600ms linear"
          }}
          onAnimationEnd={() => {
            setRippleList((prev) => prev.filter((r) => r.id !== ripple.id));
          }}
        />
      ))}
      {/* content */}
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
    </button>
  );
});

RippleButton.displayName = "RippleButton";
