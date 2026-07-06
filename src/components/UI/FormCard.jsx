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

// Define the keyframes for the pulsing animation
const pulse = keyframes`
  0% {
    opacity: 0.8;
    transform: scale(0.98) translateY(0px);
  }
  50% {
    opacity: 1;
    transform: scale(1) translateY(-10px);
  }
  100% {
    opacity: 0.8;
    transform: scale(0.98) translateY(0px);
  }
`;
function FormCard({ title, children }) {
  const theme = useTheme(); // Get the theme object
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: { xs: '90vw', sm: 420 }, // Responsive width
            height: { xs: '90vw', sm: 420 }, // Responsive height
            borderRadius: '50%', // This makes it a circle
            position: 'relative', // Required for the glare pseudo-element
            overflow: 'hidden', // Ensures the glare stays within the card's bounds
            textAlign: 'center', // Center align text like the title
            // Apply the gradient with a semi-transparent overlay to reduce intensity
            background: `linear-gradient(
              ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)'},
              ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)'}
            ), linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            color: theme.palette.getContrastText(theme.palette.background.paper), // Ensure text is readable
            animation: `${pulse} 4s ease-in-out infinite`, // Apply the pulsing animation
            // Create a subtle glare effect from the top-left
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `radial-gradient(circle at 0% 0%, ${
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'
              } 0%, transparent 40%)`,
            },
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            {title}
          </Typography>
          {children}
        </Card>
      </Box>
    </Container>
  );
}

export default FormCard;