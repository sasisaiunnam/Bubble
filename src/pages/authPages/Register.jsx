import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import FormCard from '../../components/UI/FormCard';
import axiosInstance from '../../components/axiosInstance';

function Register() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setError('');
    setEmail(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call the backend API to send a verification OTP
      const response = await axiosInstance.post('/auth/register', { email });
      const verificationToken = response.data.verificationToken;

      // On success, navigate to the verification page, passing the email and token
      navigate('/verify-email', { state: { email: email, token: verificationToken } });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to send verification code. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Register">
      <Typography variant="body2" align="center" sx={{ mb: 2, color: 'text.secondary' }}>
        Enter your email address to receive a verification code.
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
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
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
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Verification Code'}
        </Button>

        {/* Back to Login */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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

export default Register;