import React from 'react';
import {
  Card,
  Box,
  Typography,
  Container,
  CssBaseline,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';

// Define the keyframes for the pulsing animation of the logo
const pulse = keyframes`
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 2px rgba(56, 123, 255, 0.4));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 10px rgba(56, 123, 255, 0.8));
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 2px rgba(56, 123, 255, 0.4));
  }
`;

function FormCard({ title, children }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: '100%', sm: 450 }, // Responsive width
            borderRadius: '24px', // Premium rounded corners
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
            background: isDark 
              ? 'rgba(17, 27, 43, 0.75)' 
              : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(30px) saturate(120%)',
            border: '1px solid',
            borderColor: isDark 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(0, 0, 0, 0.06)',
            boxShadow: isDark 
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' 
              : '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDark 
                ? '0 12px 40px 0 rgba(0, 0, 0, 0.45)' 
                : '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
            },
          }}
        >
          {/* Pulsing Logo Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <BubbleChartIcon 
              sx={{ 
                color: 'primary.main', 
                fontSize: 36,
                animation: `${pulse} 2s ease-in-out infinite`
              }} 
            />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                letterSpacing: -0.5,
                background: 'linear-gradient(45deg, #387BFF 30%, #A855F7 90%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}
            >
              Bubble
            </Typography>
          </Box>

          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
            {title}
          </Typography>
          {children}
        </Card>
      </Box>
    </Container>
  );
}

export default FormCard;