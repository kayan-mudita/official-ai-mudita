"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  /** Direction the element fades in from. Default: "up" */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Delay in seconds before animation starts. Default: 0 */
  delay?: number;
  /** Duration of the animation in seconds. Default: 0.7 */
  duration?: number;
  /** Distance in pixels the element travels. Default: 30 */
  distance?: number;
  /** How much of the element must be visible to trigger. Default: 0.15 */
  threshold?: number;
  /** Whether the animation should only trigger once. Default: true */
  once?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

// Apple/Vercel easing curve — smooth and intentional
const EASING: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

function getInitialTransform(direction: FadeInProps["direction"], distance: number) {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    case "none":
    default:
      return {};
  }
}

export default function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  distance = 30,
  threshold = 0.15,
  once = true,
  className,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });

  const initialTransform = getInitialTransform(direction, distance);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...initialTransform }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...initialTransform }
      }
      transition={{
        duration,
        delay,
        ease: EASING,
      }}
    >
      {children}
    </motion.div>
  );
}
