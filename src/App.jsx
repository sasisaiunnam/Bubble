import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { Box, Switch, FormControlLabel } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useThemeToggle } from './components/AppThemeProvider';
import Login from './pages/authPages/login';
import AnimatedBackground from './components/UI/AnimatedBackground';
import Register from './pages/authPages/Register';
import VerifyEmail from './pages/authPages/VerifyEmail';
import CreateAccount from './pages/authPages/createAccount';
import ForgotPassword from './pages/authPages/ForgotPassword';
import ResetPassword from './pages/authPages/ResetPassword';
import ChatPage from './pages/chatPages/ChatPage';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './pages/usersPage/UserProfile';
import EditProfile from './pages/usersPage/EditProfile';
import LocationPage from './pages/locationPages/location';
import { socket } from './socket';
import { selectIsAuthenticated } from './store/slices/authSlice';

function App() {
  const { toggleTheme, mode } = useThemeToggle();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (isAuthenticated) {
      socket.auth = { token };
      socket.connect();
    } else {
      socket.disconnect();
    }

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token]);

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
        {/* Public routes are only accessible to unauthenticated users */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/create-user" element={<CreateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/location" element={<LocationPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;