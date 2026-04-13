/**
 * Official AI Design System Tokens
 *
 * Single source of truth for typography, colors, radii, and elevation.
 * Imported by tailwind.config.js (CJS) and components (ESM).
 *
 * Tailwind classes generated:
 *   Typography: text-h0, text-h1, ..., text-p1, text-p2, text-p3, text-title, text-label-btn, text-label-nav
 *   Colors:     special-500, utility-400, positive-500, negative-400, gray-900, etc.
 *   Radius:     rounded-sm (8px), rounded-DEFAULT (12px), rounded-display (24px)
 *   Shadow:     shadow-lite, shadow-sm
 */

// ---------------------------------------------------------------------------
// Typography — all Inter font, 150% (1.5) line-height
// ---------------------------------------------------------------------------
const fontSize = {
  h0: ["3rem", { lineHeight: "1.5" }],         // 48px — Display
  h1: ["2.5rem", { lineHeight: "1.5" }],       // 40px — Primary Header
  h2: ["2rem", { lineHeight: "1.5" }],         // 32px — Section Header
  h3: ["1.5rem", { lineHeight: "1.5" }],       // 24px — Subsection Header
  h4: ["1.25rem", { lineHeight: "1.5" }],      // 20px — Card Header
  h5: ["1rem", { lineHeight: "1.5" }],         // 16px — Field Header
  h6: ["0.875rem", { lineHeight: "1.5" }],     // 14px — Small Header
  title: ["1.125rem", { lineHeight: "1.5" }],  // 18px — Title
  p1: ["1rem", { lineHeight: "1.5" }],         // 16px — Paragraph
  p2: ["0.875rem", { lineHeight: "1.5" }],     // 14px — Paragraph small
  p3: ["0.75rem", { lineHeight: "1.5" }],      // 12px — Caption
  "label-btn": ["0.75rem", { lineHeight: "1.5" }],  // 12px — Button Label
  "label-nav": ["0.875rem", { lineHeight: "1.5" }], // 14px — Nav Label
};

// ---------------------------------------------------------------------------
// Colors — designer-provided anchors marked with *. Gaps interpolated.
// ---------------------------------------------------------------------------
const colors = {
  special: {
    900: "#2D0038",
    800: "#4A005C",
    750: "#58006D",
    700: "#66007E",
    600: "#73008E",
    500: "#81009E",  // * anchor
    450: "#9B30B5",
    400: "#B560CC",
    300: "#CE8FE0",
    200: "#E3BEF0",
    100: "#F9E6FE",  // * designer
    75: "#F9E6FE",   // * designer
    50: "#FCF3FF",
  },
  utility: {
    900: "#0C1926",  // * Figma — darkest background, secondary button fill (dark)
    800: "#0C0F11",  // * Figma — app background (dark mode), primary button fill (light)
    700: "#153856",  // * Figma — primary button hover (dark), dark navy accent
    600: "#055779",
    500: "#00749E",  // * Figma — links, secondary button text (light)
    450: "#089FCC",
    400: "#0FCBFF",  // * Figma — mapped as utility-300 in Figma spec
    300: "#0FCBFF",  // * Figma — accent/interactive highlight, hover text (dark)
    200: "#C7F2FF",  // * Figma — light blue tint
    100: "#E1F6FF",  // * Figma — primary light surface, tag bg (light)
    75: "#ECF9FF",   // * Figma — nav toolbar background (light)
    50: "#F6FCFF",   // * Figma — off-white background (light)
  },
  positive: {
    900: "#073109",  // * Figma — positive tag/micro bg (dark)
    800: "#073109",  // * Figma
    750: "#0C4A08",
    700: "#117000",  // * Figma — positive dark accent
    600: "#107000",
    500: "#117000",  // * Figma
    450: "#2EA320",
    400: "#53E65B",  // * Figma — mapped as positive-300 in Figma spec
    300: "#53E65B",  // * Figma — positive text, success indicator
    200: "#B3F5B6",
    100: "#E1FFDE",  // * Figma — positive tag bg (light)
    75: "#EEFEED",
    50: "#F6FFF5",
  },
  negative: {
    900: "#260C16",  // * designer
    800: "#3B0A1D",  // * designer
    750: "#5E0820",
    700: "#880523",
    600: "#A80326",
    500: "#CC0029",  // * anchor
    450: "#E50834",
    400: "#FF0F3F",  // * designer
    300: "#FF4268",  // * designer
    200: "#FF8FA6",
    100: "#FFDEE4",  // * designer
    75: "#FFECF0",
    50: "#FFF5F7",
  },
  gray: {
    "pure-dark": "#070707",  // * Figma — absolute black, dark text on light
    900: "#181A1E",  // * designer
    800: "#37393E",  // * designer
    750: "#383D47",  // * designer
    700: "#4E5260",
    600: "#6E7280",
    500: "#878B97",
    450: "#9F9F9F",  // * designer
    400: "#C4C4C4",  // * designer
    300: "#D4D5D8",
    200: "#E1E2E4",  // * designer
    100: "#E9EAEC",  // * designer
    75: "#F0F0F1",
    50: "#F4F5F5",   // * designer
    "pure-light": "#FFFFFF",
  },
};

// ---------------------------------------------------------------------------
// Corner Radius
// ---------------------------------------------------------------------------
const borderRadius = {
  sm: "8px",       // Small — checkboxes, mobile image containers
  DEFAULT: "12px", // Most components — buttons, cards, form fields, tags
  display: "24px", // Modals, drawers, elevated cards, site headers, nav toolbar
  pill: "200px",   // Micro buttons, radio buttons, profile avatars
};

// ---------------------------------------------------------------------------
// Elevation / Shadows
// ---------------------------------------------------------------------------
const boxShadow = {
  lite: "0 4px 45px rgba(0, 0, 0, 0.05)",   // Figma — subtle elevation
  sm: "0 4px 24px rgba(0, 0, 0, 0.10)",     // Figma — cards, elevated surfaces
};

module.exports = { fontSize, colors, borderRadius, boxShadow };
