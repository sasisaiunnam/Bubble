import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF', // White for primary actions to stand out
      contrastText: '#000000',
    },
    secondary: {
      main: '#BB86FC', // A vibrant purple for secondary accents
    },
    background: {
      default: '#000000', // True "onyx black" background
      paper: '#121212', // A slightly lighter black for cards/paper
    },
    text: {
      primary: '#F8FAFC',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  shape: {
    borderRadius: 16, // Rounder elements to capture the "bubble" aesthetic
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Prevents MUI's default dark mode elevation overlays
          border: '1px solid rgba(255, 255, 255, 0.12)', // Subtle border for contrast
        },
      },
    },
  },
});

export default theme;