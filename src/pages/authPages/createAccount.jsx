import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Email, Person, Lock } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../components/UI/axiosInstance';
import { initSodium, generateKeys, toBase64 } from '../../crypto';
import { db } from '../../db';
import { 
  completeRegistration,
  selectAuthStatus,
  selectAuthError,
  clearAuthError 
} from '../../store/slices/authSlice';

function CreateAccount() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Get data from location state
  const token = location.state?.token || null;
  const email = location.state?.email || '';

  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  // Steps for the stepper
  const steps = ['Verify Email', 'Create Account', 'Done'];

  // Check verification status on mount
  useEffect(() => {
    if (!email || !token) {
      navigate('/register');
      return;
    }

    const checkVerification = async () => {
      try {
        setCheckingVerification(true);
        await axiosInstance.post(
          '/auth/verification-status',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setVerified(true);
        setActiveStep(1);
      } catch (err) {
        console.error('Verification status error:', err);
        setError('Email verification required. Please verify your email first.');
        setActiveStep(0);
        navigate('/verify-email', { state: { email, token } });
      } finally {
        setCheckingVerification(false);
      }
    };

    checkVerification();
  }, [email, token, navigate]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]+/)) strength++;
    if (pwd.match(/[A-Z]+/)) strength++;
    if (pwd.match(/[0-9]+/)) strength++;
    if (pwd.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
    return strength;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    checkPasswordStrength(value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    // Username validation
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (username.trim().length > 20) {
      setError('Username cannot exceed 20 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    // Password validation
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!verified) {
      setError('Email verification is required before creating an account.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Initialize crypto
      await initSodium();
      
      // Generate key pair
      const { publicKey, privateKey } = generateKeys();
      
      // Store private key in IndexedDB
      await db.keyStore.put({ keyName: 'privateKey', key: privateKey });

      // Prepare user data
      const userData = {
        username: username.trim(),
        password,
        publicKey: toBase64(publicKey),
        token,
      };

      // Complete the registration flow with the verification token
      await dispatch(completeRegistration(userData)).unwrap();
      
      // Update step
      setActiveStep(2);
      
      // Navigate after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      const errorMessage = err || 'Account creation failed. Please try again.';
      setError(errorMessage);
      console.error('Create user error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength <= 1) return theme.palette.error.main;
    if (passwordStrength === 2) return theme.palette.warning.main;
    if (passwordStrength === 3) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Get password strength label
  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  if (checkingVerification) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 560, mx: 'auto', px: 2, py: 4 }}>
      {/* Header */}
      <Typography variant="h4" align="center" sx={{ mb: 1, fontWeight: 700 }}>
        Create Account
      </Typography>
      <Typography variant="body2" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
        Finish signing up with a secure username and password.
      </Typography>

      {/* Stepper */}
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={index === activeStep && index === 2 ? CheckCircle : undefined}
              sx={{
                '& .MuiStepLabel-label': {
                  fontWeight: index === activeStep ? 600 : 400,
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: '12px' }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {authError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: '12px' }}
          onClose={() => dispatch(clearAuthError())}
        >
          {authError}
        </Alert>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            p: 3,
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
            {verified && (
              <CheckCircle sx={{ ml: 1, color: 'success.main', fontSize: 16 }} />
            )}
          </Box>
          <TextField
            margin="none"
            required
            fullWidth
            disabled
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '28px' } }}
          />
        </Paper>

        {/* Username Field */}
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            p: 3,
            borderRadius: '16px',
            background: 'linear-gradient(180deg, rgba(255, 250, 238, 0.95), rgba(255, 248, 231, 0.95))',
            border: '1px solid rgba(237, 108, 2, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Person sx={{ mr: 1, color: 'warning.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'warning.main' }}>
              Username
            </Typography>
          </Box>
          <TextField
            margin="none"
            required
            fullWidth
            id="username"
            label="Choose a username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            inputProps={{ maxLength: 20 }}
            helperText={username.length > 0 && `${username.length}/20 characters`}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '28px' } }}
          />
        </Paper>

        {/* Password Field */}
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            p: 3,
            borderRadius: '16px',
            background: 'linear-gradient(180deg, rgba(237, 255, 245, 0.95), rgba(227, 255, 237, 0.95))',
            border: '1px solid rgba(46, 125, 50, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Lock sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
              Password
            </Typography>
          </Box>
          <TextField
            margin="none"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '28px' } }}
          />
          
          {/* Password Strength Indicator */}
          {password && (
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Password strength:
                </Typography>
                <Typography variant="caption" sx={{ color: getStrengthColor(), fontWeight: 600 }}>
                  {getStrengthLabel()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                {[1, 2, 3, 4].map((level) => (
                  <Box
                    key={level}
                    sx={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: level <= passwordStrength ? getStrengthColor() : 'grey.200',
                      transition: 'background-color 0.3s',
                    }}
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Min 6 characters with a mix of letters, numbers & symbols
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Confirm Password Field */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 3,
            borderRadius: '16px',
            background: 'linear-gradient(180deg, rgba(247, 236, 255, 0.95), rgba(239, 225, 255, 0.95))',
            border: '1px solid rgba(156, 39, 176, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Lock sx={{ mr: 1, color: 'secondary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
              Confirm Password
            </Typography>
            {confirmPassword && password === confirmPassword && (
              <CheckCircle sx={{ ml: 1, color: 'success.main', fontSize: 16 }} />
            )}
          </Box>
          <TextField
            margin="none"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            error={!!confirmPassword && password !== confirmPassword}
            helperText={
              confirmPassword && password !== confirmPassword
                ? 'Passwords do not match'
                : ''
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '28px' } }}
          />
        </Paper>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 1,
            mb: 2,
            borderRadius: '50px',
            py: 1.75,
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
          disabled={loading || !verified}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
        </Button>

        {/* Back to Login */}
        <Box sx={{ textAlign: 'center' }}>
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
            }}
            disabled={loading}
          >
            Already have an account? Sign In
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default CreateAccount;