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

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
  });

  useEffect(() => {
    // If no email is passed in state, redirect back to the start of the flow
    if (!location.state?.email) {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real app, you would send this data to your backend API
    // POST /api/auth/reset-password
    console.log('Reset password data submitted:', formData);
    // On success, you would likely navigate to the login page
    // navigate('/');
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
          Update Password
        </Button>
      </Box>
    </FormCard>
  );
}

export default ResetPassword;