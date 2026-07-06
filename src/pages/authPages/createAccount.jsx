import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../components/UI/axiosInstance';
import { initSodium, generateKeys, toBase64 } from '../../crypto';
import { db } from '../../db';

function CreateAccount() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const token = location.state?.token || null;
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email || !token) {
      navigate('/register');
      return;
    }

    const checkVerification = async () => {
      try {
        setLoading(true);
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
      } catch (err) {
        console.error('Verification status error:', err);
        navigate('/verify-email', { state: { email, token } });
      } finally {
        setLoading(false);
      }
    };

    checkVerification();
  }, [email, token, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!verified) {
      setError('Email verification is required before creating an account.');
      return;
    }

    setLoading(true);

    try {
      await initSodium();
      const { publicKey, privateKey } = generateKeys();
      await db.keyStore.put({ keyName: 'privateKey', key: privateKey });

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const userData = {
        username,
        password,
        publicKey: toBase64(publicKey),
      };

      await axiosInstance.post('/auth/create-user', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate('/login');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Account creation failed. Please try again.';
      setError(errorMessage);
      console.error('Create user error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 520, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h4" align="center" sx={{ mb: 1, fontWeight: 700 }}>
        Create Account
      </Typography>
      <Typography variant="body2" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
        Finish signing up with a secure username and password.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box
          sx={{
            mb: 2,
            p: 3,
            borderRadius: '28px',
            background: 'linear-gradient(180deg, rgba(235, 245, 255, 0.95), rgba(255, 255, 255, 0.95))',
            boxShadow: '0 20px 45px rgba(8, 39, 96, 0.08)',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
            Email Address
          </Typography>
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
        </Box>

        <Box
          sx={{
            mb: 2,
            p: 3,
            borderRadius: '28px',
            background: 'linear-gradient(180deg, rgba(255, 250, 238, 0.95), rgba(255, 248, 231, 0.95))',
            boxShadow: '0 20px 45px rgba(102, 62, 10, 0.08)',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'secondary.main' }}>
            Username
          </Typography>
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '28px' } }}
          />
        </Box>

        <Box
          sx={{
            mb: 2,
            p: 3,
            borderRadius: '28px',
            background: 'linear-gradient(180deg, rgba(237, 255, 245, 0.95), rgba(227, 255, 237, 0.95))',
            boxShadow: '0 20px 45px rgba(15, 94, 60, 0.08)',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'success.main' }}>
            Password
          </Typography>
          <TextField
            margin="none"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '28px' } }}
          />
        </Box>

        <Box
          sx={{
            mb: 2,
            p: 3,
            borderRadius: '28px',
            background: 'linear-gradient(180deg, rgba(247, 236, 255, 0.95), rgba(239, 225, 255, 0.95))',
            boxShadow: '0 20px 45px rgba(98, 46, 129, 0.08)',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'secondary.main' }}>
            Confirm Password
          </Typography>
          <TextField
            margin="none"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '28px' } }}
          />
        </Box>

        {error && (
          <Typography color="error" variant="body2" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 1,
            mb: 2,
            borderRadius: '50px',
            py: 1.75,
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
        </Button>
      </Box>
    </Box>
  );
}

export default CreateAccount;
