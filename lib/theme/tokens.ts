/**
 * Design tokens — exported as TS constants for use in inline styles
 * (matching the prototype's pattern). For className-based use, the same
 * tokens are wired as CSS custom properties in app/globals.css.
 */

export const TLP = {
  navy: "#0d1b3e",
  navyLight: "#1a2d5a",
  teal: "#0a9b8a",
  tealLight: "#e6f7f5",
  amber: "#f5a623",
  amberLight: "#fef3dc",
  red: "#e53e3e",
  redLight: "#fff5f5",
  green: "#38a169",
  greenLight: "#f0fff4",
  purple: "#805ad5",
  purpleLight: "#faf5ff",
  blue: "#3182ce",
  blueLight: "#ebf8ff",
  bg: "#f4f6fa",
  white: "#ffffff",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
} as const;

export type PlanetName = "Chess" | "Math" | "English" | "Finance" | "Arts" | "Business";

export const PLANETS: Record<PlanetName, { color: string; bg: string; icon: string }> = {
  Chess: { color: TLP.teal, bg: TLP.tealLight, icon: "♟" },
  Math: { color: TLP.blue, bg: TLP.blueLight, icon: "∑" },
  English: { color: TLP.green, bg: TLP.greenLight, icon: "Aa" },
  Finance: { color: TLP.amber, bg: TLP.amberLight, icon: "$" },
  Arts: { color: TLP.purple, bg: TLP.purpleLight, icon: "🎨" },
  Business: { color: "#e67e22", bg: "#fef9f0", icon: "💼" },
};

export function planetStyle(name: string): { color: string; bg: string; icon: string } {
  return (
    PLANETS[name as PlanetName] ?? {
      color: TLP.gray500,
      bg: TLP.gray100,
      icon: "•",
    }
  );
}

export const SHADOW = {
  card: "0 1px 4px rgba(13,27,62,0.08)",
  cardHover: "0 4px 16px rgba(13,27,62,0.14)",
  modal: "0 20px 60px rgba(0,0,0,0.2)",
} as const;
