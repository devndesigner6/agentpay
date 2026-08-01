import React from "react";
import { cn } from "../../utils/cn.js";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-size": shimmerSize,
            "--shimmer-duration": shimmerDuration,
            "--border-radius": borderRadius,
            "--background": background,
          } as React.CSSProperties
        }
        className={cn(
          "group relative flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--background)] [border-radius:var(--border-radius)]",
          "transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] font-sans font-bold",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div className="absolute inset-0 z-0 overflow-visible [container-type:size]">
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] w-[100cqw] animate-shimmer-btn-slide [aspect-ratio:1] [background:radial-gradient(circle_at_100%_50%,var(--shimmer-color)_30%,transparent_100%)] [mask-image:linear-gradient(transparent,white_50%,transparent_100%)]" />
        </div>

        {/* shadow */}
        <div className="absolute inset-[2px] z-0 rounded-[inherit] [background:var(--background)] transition-all duration-300 group-hover:inset-[1px]" />

        {/* content */}
        <div className="relative z-10 flex items-center gap-1.5">{children}</div>
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
