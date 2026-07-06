import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import FormCard from '../../components/UI/FormCard';
import axiosInstance from '../../components/UI/axiosInstance';

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
      <Typography variant="body2" align="center" sx={{ mb: 2 }}>
        Enter your email address to receive a verification code.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
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
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Verification Code'}
        </Button>
      </Box>
    </FormCard>
  );
}

export default Register;