// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    cream: Palette['primary'];
    lightBlue: Palette['primary'];
    lavender: Palette['primary'];
    deepPurple: Palette['primary'];
    navy: Palette['primary'];
  }

  interface PaletteOptions {
    cream?: PaletteOptions['primary'];
    lightBlue?: PaletteOptions['primary'];
    lavender?: PaletteOptions['primary'];
    deepPurple?: PaletteOptions['primary'];
    navy?: PaletteOptions['primary'];
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#710096', // deepPurple
      light: '#A782EC', // lavender
      dark: '#06114F', // navy
      contrastText: '#fff',
    },
    secondary: {
      main: '#5EC5D4', // lightBlue
      light: '#F6F7A9', // cream
      dark: '#06114F', // navy
      contrastText: '#000',
    },
    cream: {
      main: '#F6F7A9',
      contrastText: '#000',
    },
    lightBlue: {
      main: '#5EC5D4',
      contrastText: '#000',
    },
    lavender: {
      main: '#A782EC',
      contrastText: '#fff',
    },
    deepPurple: {
      main: '#710096',
      contrastText: '#fff',
    },
    navy: {
      main: '#06114F',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#06114F',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#710096',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#06114F',
    },
    body1: {
      fontSize: '1rem',
      color: '#06114F',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});