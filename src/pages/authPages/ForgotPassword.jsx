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
  useTheme,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Email, ArrowBack, CheckCircle } from '@mui/icons-material';
import FormCard from '../../components/UI/FormCard';
import { 
  forgotPassword, 
  selectAuthStatus, 
  selectAuthError,
  clearAuthError 
} from '../../store/slices/authSlice';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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

  // Handle resend timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Handle success state
  useEffect(() => {
    if (authStatus === 'succeeded' && isSubmitted) {
      // Start timer for resend
      setResendTimer(60);
    }
  }, [authStatus, isSubmitted]);

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

    setLoading(true);
    setError('');
    setIsSubmitted(true);

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      // Success state is handled by useEffect
    } catch (error) {
      // Error is handled by Redux
      console.error('Forgot Password error:', error);
      setIsSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setResendTimer(60);
    } catch (error) {
      console.error('Resend OTP error:', error);
    }
  };

  const handleNavigateToReset = () => {
    navigate('/reset-password', { 
      state: { 
        email: email 
      } 
    });
  };

  const isSuccess = authStatus === 'succeeded' && isSubmitted;

  return (
    <FormCard title="Forgot Password">
      <Typography variant="body2" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
        Enter your email address and we will send you an OTP to reset your password.
      </Typography>

      {/* Success Message */}
      {isSuccess && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            borderRadius: '12px',
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleNavigateToReset}
              sx={{ fontWeight: 600 }}
            >
              Go to Reset
            </Button>
          }
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            OTP Sent Successfully!
          </Typography>
          <Typography variant="body2">
            We've sent a 6-digit OTP to <strong>{email}</strong>. 
            Please check your inbox and spam folder.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Didn't receive the OTP? 
              <Button 
                size="small" 
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                sx={{ 
                  ml: 1, 
                  textTransform: 'none',
                  fontWeight: 600,
                  '&.Mui-disabled': {
                    color: 'text.disabled'
                  }
                }}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </Button>
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Error Message */}
      {authError && !isSuccess && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: '12px' 
          }}
          onClose={() => dispatch(clearAuthError())}
        >
          {authError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '16px',
            background: 'linear-gradient(180deg, rgba(235, 245, 255, 0.95), rgba(255, 255, 255, 0.95))',
            border: '1px solid rgba(25, 118, 210, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Email sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Email Address
            </Typography>
          </Box>
          <TextField
            margin="none"
            required
            fullWidth
            id="email"
            label="Enter your email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleChange}
            error={!!validationError || !!authError}
            helperText={validationError}
            disabled={loading || isSuccess}
            InputProps={{
              endAdornment: email && !validationError && (
                <InputAdornment position="end">
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '28px',
              },
            }}
          />
        </Paper>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading || isSuccess || !email}
          sx={{
            mt: 3,
            mb: 2,
            borderRadius: '50px',
            py: 1.5,
            height: '52px',
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
          ) : isSuccess ? (
            'OTP Sent ✓'
          ) : (
            'Send Reset OTP'
          )}
        </Button>

        {/* Back to Login */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 1 }}>
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

          {isSuccess && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNavigateToReset}
              sx={{
                borderRadius: '50px',
                textTransform: 'none',
                px: 3,
              }}
            >
              Continue to Reset
            </Button>
          )}
        </Box>

        {/* Help Text */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> The OTP will expire in 10 minutes.
            If you don't receive the email, check your spam folder.
          </Typography>
        </Box>
      </Box>
    </FormCard>
  );
}

export default ForgotPassword;