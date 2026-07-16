import React, { useState, useEffect } from 'react';
import {
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Link as MuiLink,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormCard from '../../components/UI/FormCard';
import { 
  loginUser, 
  selectAuthStatus, 
  selectAuthError,
  clearAuthError 
} from '../../store/slices/authSlice';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const loading = authStatus === 'loading';

  // Clear errors when component unmounts or user changes inputs
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  // Redirect on successful login
  useEffect(() => {
    if (authStatus === 'succeeded') {
      navigate('/chat');
    }
  }, [authStatus, navigate]);

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    // Clear specific field error when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
    
    // Clear auth error when user types
    if (authError) {
      dispatch(clearAuthError());
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    // Prepare login data
    const loginData = {
      email: formData.email.trim(),
      password: formData.password,
    };

    try {
      await dispatch(loginUser(loginData)).unwrap();
      // Navigation will happen in useEffect
    } catch (error) {
      // Error is already handled by Redux
      console.error('Login failed:', error);
    }
  };

  return (
    <FormCard title="Sign in">
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        noValidate 
        sx={{ 
          mt: { xs: 0.5, sm: 1.5 }, 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 1.25, sm: 2 } 
        }}
      >
        {/* Email Field */}
        <TextField
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={formData.email}
          onChange={handleChange}
          error={!!validationErrors.email}
          helperText={validationErrors.email}
          disabled={loading}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '32px',
            },
            '& .MuiFormHelperText-root': {
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              margin: '3px 14px 0',
            }
          }}
        />

        {/* Password Field */}
        <TextField
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          error={!!validationErrors.password}
          helperText={validationErrors.password}
          disabled={loading}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '32px',
            },
            '& .MuiFormHelperText-root': {
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              margin: '3px 14px 0',
            }
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    size={isMobile ? 'small' : 'medium'}
                  >
                    {showPassword ? <VisibilityOff fontSize={isMobile ? 'small' : 'medium'} /> : <Visibility fontSize={isMobile ? 'small' : 'medium'} />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Auth Error Display */}
        {authStatus === 'failed' && authError && (
          <Alert 
            severity="error" 
            sx={{ borderRadius: '16px', py: { xs: 0, sm: 1 }, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
            onClose={() => dispatch(clearAuthError())}
          >
            {authError}
          </Alert>
        )}

        {/* Remember Me & Forgot Password */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            px: 1,
            mt: { xs: -1, sm: -0.5 }
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                color="primary"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                size="small"
              />
            }
            label={<Typography variant={isMobile ? 'caption' : 'body2'}>Remember me</Typography>}
          />
          <MuiLink
            component="button"
            variant={isMobile ? 'caption' : 'body2'}
            onClick={() => navigate('/forgot-password')}
            sx={{ 
              cursor: 'pointer', 
              background: 'none', 
              border: 'none', 
              color: 'inherit', 
              textDecoration: 'underline',
              '&:hover': {
                color: theme.palette.primary.main,
              },
              '&:disabled': {
                cursor: 'not-allowed',
                opacity: 0.5,
              }
            }}
            disabled={loading}
          >
            Forgot password?
          </MuiLink>
        </Box>

        {/* Sign In Button */}
        <Button
          type="submit"
          disabled={loading}
          variant="contained"
          fullWidth
          sx={{
            py: { xs: 0.8, sm: 1.25 },
            borderRadius: '32px',
            color: theme.palette.primary.contrastText,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            transition: 'transform 0.2s ease-in-out, opacity 0.2s',
            boxShadow: '0 8px 25px rgba(56, 123, 255, 0.25)',
            fontSize: { xs: '0.825rem', sm: '0.875rem' },
            '&:hover': {
              transform: 'scale(1.02)',
              opacity: 0.95,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            },
            '&:disabled': {
              opacity: 0.7,
            },
          }}
        >
          {loading ? (
            <CircularProgress size={isMobile ? 18 : 24} color="inherit" />
          ) : (
            'Sign In'
          )}
        </Button>

        {/* Sign Up Link */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: -0.5, sm: 0.5 } }}>
          <MuiLink
            component="button"
            variant={isMobile ? 'caption' : 'body2'}
            onClick={() => navigate('/register')}
            sx={{ 
              cursor: 'pointer', 
              background: 'none', 
              border: 'none', 
              color: 'inherit', 
              textDecoration: 'underline',
              '&:hover': {
                color: theme.palette.primary.main,
              },
              '&:disabled': {
                cursor: 'not-allowed',
                opacity: 0.5,
              }
            }}
            disabled={loading}
          >
            {"Don't have an account? Sign Up"}
          </MuiLink>
        </Box>
      </Box>
    </FormCard>
  );
}

export default Login;