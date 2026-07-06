import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import FormCard from '../../components/UI/FormCard';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real app, you would send this data to your backend API
    // POST /api/auth/forgot-password
    console.log('Forgot password request for email:', email);

    // On success, navigate to the reset password page, passing the email
    navigate('/reset-password', { state: { email: email } });
  };

  return (
    <FormCard title="Forgot Password">
      <Typography variant="body2" align="center" sx={{ mb: 2 }}>
        Enter your email address and we will send you an OTP to reset your password.
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
          Send Reset OTP
        </Button>
      </Box>
    </FormCard>
  );
}

export default ForgotPassword;