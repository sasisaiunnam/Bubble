import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import FormCard from '../../components/UI/FormCard';

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    // If no email is passed in state, redirect back to the start of registration
    if (!location.state?.email) {
      navigate('/register');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real app, you would send this data to your backend API
    // POST /api/auth/verify-email
    console.log('Verification data submitted:', formData);
  };

  return (
    <FormCard title="Verify & Register">
      <Typography variant="body2" align="center" sx={{ mb: 2 }}>
        An OTP has been sent to your email. Please enter it below to complete your registration.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          disabled // Email should not be editable at this stage
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={formData.email}
          // onChange is removed to prevent changes
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
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
        />
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
          Create Account
        </Button>
      </Box>
    </FormCard>
  );
}

export default VerifyEmail;