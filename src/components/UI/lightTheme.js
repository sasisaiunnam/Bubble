import { createTheme } from '@mui/material/styles';

const bubbleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4B6EF5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#64D8CB',
      contrastText: '#081B33',
    },
    background: {
      default: '#EBF3FF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#10254E',
      secondary: '#5B6B91',
    },
  },
  shape: {
    borderRadius: 28,
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(circle at top left, rgba(123, 159, 255, 0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(149, 223, 245, 0.16), transparent 24%), #EAF2FF',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          background: 'rgba(255, 255, 255, 0.96)',
          boxShadow: '0 24px 60px rgba(75, 110, 245, 0.12)',
          border: '1px solid rgba(75, 110, 245, 0.08)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 32,
            backgroundColor: '#FFFFFF',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          boxShadow: '0 12px 24px rgba(75, 110, 245, 0.16)',
        },
      },
    },
  },
});

export default bubbleTheme;