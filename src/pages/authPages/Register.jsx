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

function Register() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real app, you would send this data to your backend API
    // POST /api/auth/register
    console.log('Registration request for email:', email);

    // On success, navigate to the verification page, passing the email
    navigate('/verify-email', { state: { email: email } });
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
          Send Verification Code
        </Button>
      </Box>
    </FormCard>
  );
}

export default Register;