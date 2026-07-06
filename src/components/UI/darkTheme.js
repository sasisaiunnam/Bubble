import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#98D9FF',
      contrastText: '#071022',
    },
    secondary: {
      main: '#C88BFF',
      contrastText: '#111827',
    },
    background: {
      default: '#07111E',
      paper: '#111B2B',
    },
    text: {
      primary: '#F4F8FF',
      secondary: 'rgba(244, 248, 255, 0.72)',
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
          background: 'radial-gradient(circle at top right, rgba(88, 167, 255, 0.14), transparent 18%), radial-gradient(circle at bottom left, rgba(200, 139, 255, 0.12), transparent 20%), #07111E',
          minHeight: '100vh',
          color: '#F4F8FF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          background: 'rgba(21, 31, 54, 0.92)',
          boxShadow: '0 24px 60px rgba(15, 66, 124, 0.24)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          background: 'rgba(22, 32, 54, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 48px rgba(6, 42, 94, 0.26)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 32,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          boxShadow: '0 12px 30px rgba(56, 154, 255, 0.18)',
        },
      },
    },
  },
});

export default theme;