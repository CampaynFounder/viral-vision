// Design System Tokens for Viral Vision
// "Digital Penthouse" Luxury Aesthetics

export const colors = {
  champagne: {
    DEFAULT: "#D4AF37",
    light: "#F3E5AB",
    dark: "#B8941F",
    gradient: "linear-gradient(to right, #D4AF37, #F3E5AB)",
  },
  mocha: {
    DEFAULT: "#8B7355",
    light: "#A68B6B",
    dark: "#6B5A42",
  },
  alabaster: {
    DEFAULT: "#FAF9F6",
    light: "#FFFFFF",
    dark: "#F5F3F0",
  },
  rosegold: {
    DEFAULT: "#E8B4B8",
    light: "#F5D7DA",
    dark: "#D99BA0",
  },
} as const;

export const typography = {
  heading: {
    fontFamily: "Cinzel, Canela, serif",
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    letterSpacing: "0.02em",
  },
  body: {
    fontFamily: "Montserrat, Geist, system-ui, sans-serif",
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    letterSpacing: "0.05em", // Uppercase tracking for "Business Class" feel
  },
} as const;

export const spacing = {
  xs: "0.5rem", // 8px
  sm: "0.75rem", // 12px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
} as const;

export const borderRadius = {
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  gold: "0 4px 14px 0 rgba(212, 175, 55, 0.3)",
} as const;

export const transitions = {
  fast: "150ms ease-in-out",
  normal: "300ms ease-in-out",
  slow: "500ms ease-in-out",
  spring: {
    stiffness: 300,
    damping: 20,
  },
} as const;

