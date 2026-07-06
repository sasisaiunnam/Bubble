import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Switch, FormControlLabel } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useThemeToggle } from './components/AppThemeProvider';
import Login from './pages/authPages/login';
import AnimatedBackground from './components/UI/AnimatedBackground';
import Register from './pages/authPages/Register';
import VerifyEmail from './pages/authPages/VerifyEmail';
import ForgotPassword from './pages/authPages/ForgotPassword';
import ResetPassword from './pages/authPages/ResetPassword';

function App() {
  const { toggleTheme, mode } = useThemeToggle();

  return (
    <>
      <AnimatedBackground />
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
          label={mode === 'dark' ? <DarkMode /> : <LightMode />}
        />
      </Box>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </>
  );
}

export default App;