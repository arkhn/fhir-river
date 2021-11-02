import React from "react";

import { createMuiTheme, useMediaQuery, Theme } from "@material-ui/core";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
declare module "@material-ui/core/styles/createMixins" {
  interface Mixins {
    appbar: {
      height: CSSProperties["height"];
    };
    breadcrumbBar: {
      height: CSSProperties["height"];
    };
    icons: {
      size: CSSProperties["height"] | CSSProperties["width"];
    };
    footer: {
      height: CSSProperties["height"];
    };
    input: {
      maxWidth: CSSProperties["maxWidth"];
    };
  }

  interface MixinsOptions {
    appbar: {
      height: CSSProperties["height"];
    };
    breadcrumbBar: {
      height: CSSProperties["height"];
    };
    icons: {
      size: CSSProperties["height"] | CSSProperties["width"];
    };
    footer: {
      height: CSSProperties["height"];
    };
    input: {
      maxWidth: CSSProperties["maxWidth"];
    };
  }
}

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
    purple: Palette["primary"];
    appBar: Palette["primary"];
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
    purple: PaletteOptions["primary"];
    appBar: PaletteOptions["primary"];
  }
}

const usePyrogTheme = (): Theme => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        shape: {
          borderRadius: 6,
        },
        mixins: {
          appbar: {
            height: 64,
          },
          breadcrumbBar: {
            height: 104,
          },
          icons: {
            size: 16,
          },
          footer: {
            height: 100,
          },
          input: {
            maxWidth: 534,
          },
        },
        palette: {
          appBar: {
            main: prefersDarkMode ? "#424242" : "#383838",
          },
          badges: {
            required: { main: "#A43C3C" },
            pending: { main: "#FFC56F" },
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
            main: prefersDarkMode ? "#3F3F3F" : "#fff",
            dark: prefersDarkMode ? "#242424" : "rgba(224, 224, 224, 1)",
            light: prefersDarkMode ? "#3F3F3F" : "#fff",
            contrastText: prefersDarkMode ? "#BCBCBC" : "#464646",
          },
          background: {
            default: prefersDarkMode ? "#303030" : "#fff",
          },
          orange: {
            main: "#CC7831",
            contrastText: "#fff",
            transparent: {
              main: "hsla(27, 100%, 50%, 0.24)",
              light: "hsla(27, 100%, 50%, 0.16)",
            },
          },
          purple: {
            main: "#71227D",
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
