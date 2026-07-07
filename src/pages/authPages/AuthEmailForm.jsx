import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import FormCard from '../UI/FormCard';
import { 
  forgotPassword, 
  selectAuthStatus, 
  selectAuthError,
  clearAuthError 
} from '../../store/slices/authSlice';

function AuthEmailForm({ 
  title, 
  description, 
  buttonText, 
  apiEndpoint, 
  successUrl,
  type = 'forgot-password' // 'forgot-password' | 'verify-email'
}) {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);
  const loading = authStatus === 'loading';

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  // Handle success response
  useEffect(() => {
    if (authStatus === 'succeeded' && isSubmitted) {
      // Navigate to success URL with email
      navigate(successUrl, { 
        state: { 
          email: email,
          type: type 
        } 
      });
    }
  }, [authStatus, isSubmitted, navigate, successUrl, email, type]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear validation error when user types
    if (validationError) {
      setValidationError('');
    }
    
    // Clear auth error when user types
    if (authError) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate email
    const error = validateEmail(email);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitted(true);

    try {
      // Dispatch appropriate action based on type
      if (type === 'forgot-password') {
        await dispatch(forgotPassword({ email })).unwrap();
      } else if (type === 'verify-email') {
        console.log('Verification flow is handled by the register page.');
        navigate(successUrl, { state: { email, type } });
      } else {
        // Fallback for custom API endpoint
        // You can implement a generic thunk or use axios directly
        console.log(`Request for ${title} for email:`, email);
        // For demo purposes, navigate after a delay
        setTimeout(() => {
          navigate(successUrl, { state: { email: email } });
        }, 1000);
      }
    } catch (error) {
      // Error is handled by Redux
      console.error(`Failed to ${type}:`, error);
      setIsSubmitted(false);
    }
  };

  // Get success message based on type
  const getSuccessMessage = () => {
    if (type === 'forgot-password') {
      return 'If an account exists with this email, you will receive a password reset link.';
    }
    if (type === 'verify-email') {
      return 'A verification link has been sent to your email.';
    }
    return description;
  };

  return (
    <FormCard title={title}>
      <Typography variant="body2" align="center" sx={{ mb: 2, color: 'text.secondary' }}>
        {description}
      </Typography>

      {/* Success Message */}
      {authStatus === 'succeeded' && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2, 
            borderRadius: '10px',
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          {getSuccessMessage()}
        </Alert>
      )}

      {/* Error Message */}
      {authError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: '10px' 
          }}
          onClose={() => dispatch(clearAuthError())}
        >
          {authError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={handleChange}
          error={!!validationError || !!authError}
          helperText={validationError}
          disabled={loading || authStatus === 'succeeded'}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
            },
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading || authStatus === 'succeeded' || !email}
          sx={{
            mt: 3,
            mb: 2,
            borderRadius: '50px',
            height: '48px',
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            transition: 'transform 0.2s ease-in-out, opacity 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              opacity: 0.9,
            },
            '&:disabled': {
              opacity: 0.7,
              transform: 'scale(0.98)',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            buttonText
          )}
        </Button>

        {/* Back to Login Link */}
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography
            component="button"
            variant="body2"
            onClick={() => navigate('/login')}
            sx={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              color: theme.palette.primary.main,
              textDecoration: 'underline',
              '&:hover': {
                color: theme.palette.primary.dark,
              },
              '&:disabled': {
                cursor: 'not-allowed',
                opacity: 0.5,
              }
            }}
            disabled={loading}
          >
            Back to Sign In
          </Typography>
        </Box>
      </Box>
    </FormCard>
  );
}

export default AuthEmailForm;