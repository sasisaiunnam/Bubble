import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useThemeToggle } from '../AppThemeProvider';

function ThemeToggle({ sx }) {
  const { toggleTheme, mode } = useThemeToggle();

  return (
    <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <IconButton
        onClick={toggleTheme}
        size="small"
        sx={{
          color: mode === 'dark' ? '#FFD54F' : '#F57C00',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          border: '1px solid',
          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          '&:hover': {
            transform: 'rotate(45deg) scale(1.1)',
            backgroundColor: mode === 'dark' ? 'rgba(255, 213, 79, 0.08)' : 'rgba(245, 124, 0, 0.08)',
          },
          ...sx
        }}
      >
        {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;
