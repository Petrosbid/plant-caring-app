"use client";
import * as React from "react";
export interface ThemeTransitionProps {
  children: React.ReactNode;
  onToggle?: () => void;
  theme?: "light" | "dark";
  className?: string;
  speed?: number;
  blur?: number;
}

export function ThemeTransition({
  children,
  onToggle,
  className,
  speed = 0.5,
  blur = 0,
}: ThemeTransitionProps) {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTransitioning) return;
    
    // Dynamically access startViewTransition to avoid static parser warnings
    const startViewTransition = (document as any).startViewTransition;
    if (!startViewTransition) {
      onToggle?.();
      return;
    }
    
    setIsTransitioning(true);
    const x = e.clientX;
    const y = e.clientY;
    const isDark = document.documentElement.classList.contains("dark");
    const targetTheme = isDark ? "to-light" : "to-dark";
    document.documentElement.style.setProperty("--x", `${x}px`);
    document.documentElement.style.setProperty("--y", `${y}px`);
    document.documentElement.style.setProperty(
      "--transition-speed",
      `${speed}s`,
    );
    document.documentElement.style.setProperty(
      "--transition-blur",
      `${blur}px`,
    );
    document.documentElement.setAttribute("data-theme-transition", targetTheme);
    try {
      const transition = startViewTransition.call(document, () => {
        onToggle?.();
      });
      await transition.finished;
    } catch (error) {
      console.error("Theme transition error:", error);
    } finally {
      document.documentElement.removeAttribute("data-theme-transition");
      setIsTransitioning(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={{ pointerEvents: isTransitioning ? "none" : "auto" }}
    >
      {children}
    </button>
  );
}