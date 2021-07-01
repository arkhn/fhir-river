import React from "react";

import { createMuiTheme, useMediaQuery, Theme } from "@material-ui/core";

declare module "@material-ui/core/styles/createPalette" {
  interface Palette {
    badges: {
      required: React.CSSProperties["color"];
      pending: React.CSSProperties["color"];
    };
    icons: {
      table: React.CSSProperties["color"];
      disabled: React.CSSProperties["color"];
      orange: Palette["primary"];
      resourceTree: Palette["primary"];
    };
  }
  interface PaletteOptions {
    badges: {
      required: React.CSSProperties["color"];
      pending: React.CSSProperties["color"];
    };
    icons: {
      table: React.CSSProperties["color"];
      disabled: React.CSSProperties["color"];
      orange: PaletteOptions["primary"];
      resourceTree: PaletteOptions["primary"];
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
            required: "red",
            pending: "orange",
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
          icons: {
            table: prefersDarkMode ? "#2f7ae2" : "#265EB1",
            disabled: "rgba(255, 255, 255, 0.5)",
            orange: {
              main: "#CC7831",
              contrastText: "#fff",
            },
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
