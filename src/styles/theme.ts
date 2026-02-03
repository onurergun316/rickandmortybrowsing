import { createGlobalStyle } from "styled-components";

export const theme = {
  colors: {
    bg: "#0b0f19",
    card: "#0f1524",
    panel: "#121a2c",
    panelHover: "#152038",
    text: "#e8eefc",
    muted: "#a7b4d0",
    border: "rgba(255,255,255,0.08)",
    borderHover: "rgba(255,255,255,0.16)",
    accent: "#7c5cff",

    badgeGreenBg: "rgba(45, 212, 191, 0.12)",
    badgeGreenText: "#5eead4",
    badgeRedBg: "rgba(248, 113, 113, 0.12)",
    badgeRedText: "#fca5a5",
    badgeGrayBg: "rgba(148, 163, 184, 0.12)",
    badgeGrayText: "#cbd5e1",
  },
  shadows: {
    soft: "0 6px 16px rgba(0,0,0,0.25)",
    medium: "0 10px 26px rgba(0,0,0,0.35)",
  },
};

export const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }

  html, body { height: 100%; }

  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
    background: ${theme.colors.bg};
    color: ${theme.colors.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a { color: inherit; }

  ::selection {
    background: rgba(124, 92, 255, 0.35);
  }
`;