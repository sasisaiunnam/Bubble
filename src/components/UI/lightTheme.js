import { createTheme } from '@mui/material/styles';

const bubbleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6200EA', // A vibrant violet
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#03DAC6', // A bright, contrasting teal/green
    },
    background: {
      default: '#F0F4FF', // A very light, cool blue background
      paper: '#FFFFFF', // The "bubble" card background
    },
    text: {
      primary: '#000033', // A very dark blue for high contrast text
      secondary: '#5f5f7f', // A softer blue-gray for secondary text
    },
  },
  shape: {
    borderRadius: 16, // Gives everything that "bubble" feel
  },
});

export default bubbleTheme;