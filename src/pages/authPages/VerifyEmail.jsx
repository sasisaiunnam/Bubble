import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  useTheme,
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import FormCard from '../../components/UI/FormCard';
import axiosInstance from '../../components/axiosInstance';

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [otp, setOtp] = useState('');
  const token = location.state?.token || null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!location.state?.email || !location.state?.token) {
      navigate('/register');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setError('');
    setOtp(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axiosInstance.post(
        '/auth/verify-email',
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate('/create-user', {
        state: { email: location.state.email, token },
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Verification failed. Please check the OTP and try again.';
      setError(errorMessage);
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Verify & Register">
      <Typography variant="body2" align="center" sx={{ mb: 2, color: 'text.secondary' }}>
        An OTP has been sent to your email. Please enter it below to complete your registration.
      </Typography>
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        noValidate 
        sx={{ 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2 
        }}
      >
        <TextField
          required
          fullWidth
          disabled // Email should not be editable at this stage
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={location.state?.email || ''}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '32px' } }}
        />
        <TextField
          required
          fullWidth
          id="otp"
          label="Verification Code"
          name="otp"
          value={otp}
          onChange={handleChange}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '32px' } }}
        />
        {error && (
          <Alert severity="error" sx={{ borderRadius: '16px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            py: 1.25,
            borderRadius: '32px',
            color: theme.palette.primary.contrastText,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            transition: 'transform 0.2s ease-in-out, opacity 0.2s',
            boxShadow: '0 8px 25px rgba(56, 123, 255, 0.25)',
            '&:hover': {
              transform: 'scale(1.02)',
              opacity: 0.95,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
        </Button>

        {/* Back to Register */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/register')}
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
            Wrong email? Go Back
          </Button>
        </Box>
      </Box>
    </FormCard>
  );
}

export default VerifyEmail;