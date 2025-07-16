import { useEffect } from "react";
import { useMotionValue, MotionValue } from "motion/react";

// Linear interpolation function for smoothing
function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

export interface UseCursorPositionReturn {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export function useCursorPosition(): UseCursorPositionReturn {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const smoothX = useMotionValue(0);
  const smoothY = useMotionValue(0);

  useEffect(() => {
    const updateSmooth = () => {
      smoothX.set(lerp(smoothX.get(), x.get(), 0.2));
      smoothY.set(lerp(smoothY.get(), y.get(), 0.2));
      requestAnimationFrame(updateSmooth);
    };

    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    const animationFrame = requestAnimationFrame(updateSmooth);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [x, y, smoothX, smoothY]);

  return {
    x: smoothX,
    y: smoothY,
  };
} 