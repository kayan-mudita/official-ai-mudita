import type { Variants } from "framer-motion";

// Apple/Vercel easing curve — matches FadeIn.tsx
export const EASING: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

/** Container that staggers its children's enter animation. */
export const staggerChildren: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/** Child variant — fade + slide up. Pair with `staggerChildren` parent. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASING },
  },
};

/** Child variant — fade only. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: EASING },
  },
};

/** Hover lift used by every interactive card. */
export const cardHover: Variants = {
  rest: { y: 0 },
  hover: {
    y: -3,
    transition: { duration: 0.25, ease: EASING },
  },
};
