import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#7AA2FF",
    },

    secondary: {
      main: "#F2C66D",
    },

    success: {
      main: "#42D85A",
    },

    error: {
      main: "#E53935",
    },

    warning: {
      main: "#F2C66D",
    },

    background: {
      default: "#0D1020",
      paper: "#171B2E",
    },

    divider: "#39456F",

    text: {
      primary: "#E8ECF7",
      secondary: "#A8B4D8",
    },
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',

    h6: {
      fontWeight: 600,
    },

    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },

  spacing: 8,

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#171B2E",
          border: "1px solid #39456F",
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,

          color: "#C9D5F2",

          transition: "150ms",

          "&:hover": {
            backgroundColor: "#303D67",
          },
          size: "small",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          size: "small",
        },
      },
    },

    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: "#171B2E",
          border: "1px solid #39456F",
          borderRadius: 12,
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#171B2E",
          borderColor: "#39456F",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#14182D",
          backgroundImage: "none",
          boxShadow: "none",
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#252B46",
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#39456F",
        },
      },
    },
  },
});

export default theme;