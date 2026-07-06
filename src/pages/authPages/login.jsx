import React, { useState } from 'react';
import {
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Link as MuiLink,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FormCard from '../../components/UI/FormCard';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const theme = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real app, you would send this data to your backend API
    console.log('Login data submitted:', {
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <FormCard title="Sign in">
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
          value={formData.email}
          onChange={handleChange}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
            },
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
            },
          }}
        />
        <Grid container sx={{ mt: 1 }} alignItems="center" justifyContent="space-between">
          <Grid item>
            <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
          </Grid>
          <Grid item>
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => navigate('/forgot-password')}
              sx={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline' }}
            >
              Forgot password?
            </MuiLink>
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="center" sx={{ mt: 3, mb: 2 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              width: '60%', // Adjust width as needed
              borderRadius: '50px',
              color: theme.palette.primary.contrastText,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            Sign In
          </Button>
        </Box>
        <Grid container justifyContent="center">
          <Grid item>
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
              sx={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline' }}
            >
              {"Don't have an account? Sign Up"}
            </MuiLink>
          </Grid>
        </Grid>
      </Box>
    </FormCard>
  );
}

export default Login;
