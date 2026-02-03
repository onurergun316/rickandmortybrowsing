import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      bg: string;
      card: string;
      panel: string;
      panelHover: string;
      text: string;
      muted: string;
      border: string;
      borderHover: string;
      accent: string;

      badgeGreenBg: string;
      badgeGreenText: string;
      badgeRedBg: string;
      badgeRedText: string;
      badgeGrayBg: string;
      badgeGrayText: string;
    };
    shadows: {
      soft: string;
      medium: string;
    };
  }
}