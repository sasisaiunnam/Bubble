import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import FormCard from '../../components/UI/FormCard';
import axiosInstance from '../../components/axiosInstance';

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If no email is passed in state, redirect back to the start of the flow
    if (!location.state?.email) {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call the backend API to reset the password
      await axiosInstance.post('/auth/reset-password', formData);

      // On success, navigate to the login page
      navigate('/login');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to reset password. Please check the OTP and try again.';
      setError(errorMessage);
      console.error('Reset Password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Reset Password">
      <Typography variant="body2" align="center" sx={{ mb: 2 }}>
        An OTP has been sent to your email. Please enter it below along with your new password.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          disabled
          id="email"
          label="Email Address"
          name="email"
          value={formData.email}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="otp"
          label="One-Time Password (OTP)"
          name="otp"
          value={formData.otp}
          onChange={handleChange}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="newPassword"
          label="New Password"
          type="password"
          id="newPassword"
          autoComplete="new-password"
          value={formData.newPassword}
          onChange={handleChange}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
        />
        {error && (
          <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            mb: 2,
            borderRadius: '50px',
            color: theme.palette.primary.contrastText,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            transition: 'transform 0.2s ease-in-out, opacity 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
              opacity: 0.9,
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
        </Button>

        {/* Back to Login */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/login')}
            disabled={loading}
            sx={{
              textTransform: 'none',
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.primary.main,
                background: 'transparent',
              },
            }}
          >
            Back to Sign In
          </Button>
        </Box>
      </Box>
    </FormCard>
  );
}

export default ResetPassword;