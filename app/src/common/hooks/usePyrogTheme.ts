import React from "react";

import { createMuiTheme, useMediaQuery, Theme } from "@material-ui/core";

declare module "@material-ui/core/styles/createPalette" {
  interface Palette {
    badges: {
      required: Palette["primary"];
      pending: Palette["primary"];
    };
    icons: {
      table: Palette["primary"];
      resourceTree: Palette["primary"];
    };
    orange: Palette["primary"] & {
      transparent: Palette["primary"];
    };
  }
  interface PaletteOptions {
    badges: {
      required: PaletteOptions["primary"];
      pending: PaletteOptions["primary"];
    };
    icons: {
      table: PaletteOptions["primary"];
      resourceTree: PaletteOptions["primary"];
    };
    orange: PaletteOptions["primary"] & {
      transparent: PaletteOptions["primary"];
    };
  }
}

const usePyrogTheme = (): Theme => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          badges: {
            required: { main: "red" },
            pending: { main: "orange" },
          },
          text: {
            primary: prefersDarkMode ? "#FFFFFF" : "#464646",
            secondary: prefersDarkMode ? "#a0a0a0" : "#858585",
          },
          type: prefersDarkMode ? "dark" : "light",
          primary: {
            main: "#60b2a2",
            light: "#92e4d3",
            dark: "#2d8273",
            contrastText: "#FFFFFF",
          },
          secondary: {
            main: "#ff9033",
          },
          orange: {
            main: "#CC7831",
            transparent: {
              main: "hsla(27, 100%, 50%, 0.24)",
              light: "hsla(27, 100%, 50%, 0.16)",
            },
          },
          icons: {
            table: { main: prefersDarkMode ? "#2f7ae2" : "#265EB1" },
            resourceTree: {
              main: prefersDarkMode ? "#FFFFFF" : "#464646",
              light: prefersDarkMode ? "#a0a0a0" : "#858585",
            },
          },
        },
      }),
    [prefersDarkMode]
  );

  return theme;
};

export default usePyrogTheme;
