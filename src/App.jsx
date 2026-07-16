import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import ThemeToggle from './components/UI/ThemeToggle';
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

function App() {
  const location = useLocation();
  const showFloatingToggle = location.pathname !== '/chat';

  return (
    <>
      <AnimatedBackground />
      {showFloatingToggle && (
        <ThemeToggle sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }} />
      )}
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
          <Route path="/user/:userId" element={<UserProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/location" element={<LocationPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;