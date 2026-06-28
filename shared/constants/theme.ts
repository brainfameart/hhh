// ─── Unity Dark Theme Palette ────────────────────────────────────────────────
// Pure TS const object — no React, no JSX.

export const THEME = {
  bgApp: "#1c1c1c",
  bgPanel: "#383838",
  bgHeader: "#282828",
  bgInput: "#2a2a2a",
  bgInputFocus: "#1e1e1e",
  border: "#1a1a1a",
  borderLight: "#444444",
  accent: "#2C5D87",
  accentHover: "#3A72B0",
  textMain: "#eeeeee",
  textMuted: "#aaaaaa",
  textDark: "#888888",
  axisX: "#8FC153",   // Unity green X axis
  axisY: "#569CE4",   // Unity blue  Y axis
  logError: "#ff6b6b",
  logWarn: "#feca57",
} as const;

export type ThemeKey = keyof typeof THEME;
