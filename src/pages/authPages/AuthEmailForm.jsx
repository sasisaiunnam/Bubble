import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography } from '@mui/material';
import FormCard from '../UI/FormCard';

function AuthEmailForm({ title, description, buttonText, apiEndpoint, successUrl }) {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real app, you would send this data to your backend API
    // POST to apiEndpoint
    console.log(`Request for ${title} for email:`, email);

    // On success, navigate to the successUrl, passing the email
    navigate(successUrl, { state: { email: email } });
  };

  return (
    <FormCard title={title}>
      <Typography variant="body2" align="center" sx={{ mb: 2 }}>
        {description}
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
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {buttonText}
        </Button>
      </Box>
    </FormCard>
  );
}

export default AuthEmailForm;