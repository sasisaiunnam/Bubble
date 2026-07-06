import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import lightTheme from './UI/lightTheme';
import darkTheme from './UI/darkTheme';

// Create a context for the theme toggle function
const ThemeToggleContext = createContext({
  toggleTheme: () => {},
  mode: 'light',
});

// Custom hook to use the theme toggle function
export const useThemeToggle = () => useContext(ThemeToggleContext);

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light'); // Default to light theme

  // Memoize the theme object to prevent unnecessary re-renders
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ toggleTheme, mode }), [mode]);

  return (
    <ThemeToggleContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeToggleContext.Provider>
  );
};