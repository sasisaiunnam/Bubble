import { createTheme } from '@mui/material/styles';

const bubbleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#387BFF', // Digital ice blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#A855F7', // Royal purple/lavender
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981', // Emerald green
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B', // Amber warning
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FB',
      paper: 'rgba(255, 255, 255, 0.85)',
    },
    text: {
      primary: '#0F172A', // Slate 900
      secondary: '#475569', // Slate 600
    },
    divider: 'rgba(0, 0, 0, 0.06)',
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
          background: 'radial-gradient(circle at top left, rgba(56, 123, 255, 0.09), transparent 28%), radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.08), transparent 32%), #F5F7FB',
          minHeight: '100vh',
          color: '#0F172A',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          background: 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0 24px 60px rgba(56, 123, 255, 0.06)',
          border: '1px solid rgba(56, 123, 255, 0.06)',
          backdropFilter: 'blur(16px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(56, 123, 255, 0.06)',
          boxShadow: '0 20px 48px rgba(56, 123, 255, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 32,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          boxShadow: '0 12px 24px rgba(56, 123, 255, 0.08)',
        },
      },
    },
  },
});

export default bubbleTheme;