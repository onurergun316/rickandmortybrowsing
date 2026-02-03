import React from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyle, theme } from "../styles/theme";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Providers;