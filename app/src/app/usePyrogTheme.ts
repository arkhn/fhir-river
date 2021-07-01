import React from "react";

import { createMuiTheme, useMediaQuery, Theme } from "@material-ui/core";

declare module "@material-ui/core/styles/createPalette" {
  interface Palette {
    badges: {
      required: string;
      pending: string;
    };
    icons: {
      table: string;
      disabled: string;
      fhir: string;
      resourceTree: Palette["primary"];
    };
  }
  interface PaletteOptions {
    badges: {
      required: string;
      pending: string;
    };
    icons: {
      table: string;
      disabled: string;
      fhir: string;
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
            fhir: "#CC7831",
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
