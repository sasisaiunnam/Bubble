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

// Define keyframes for organic bubble-like shape morphing
const bubbleMorph = keyframes`
  0% {
    border-radius: 42px 78px 52px 68px / 62px 48px 72px 58px;
  }
  33% {
    border-radius: 70px 50px 68px 52px / 52px 70px 48px 68px;
  }
  66% {
    border-radius: 52px 68px 48px 70px / 68px 52px 70px 48px;
  }
  100% {
    border-radius: 42px 78px 52px 68px / 62px 48px 72px 58px;
  }
`;

// Define keyframes for vertical floating movement
const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
  100% {
    transform: translateY(0px);
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
          animation: `${float} 6s ease-in-out infinite`,
        }}
      >
        <Card
          sx={{
            p: { xs: 4, sm: 5 }, // Increased padding for morph safety
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: '100%', sm: 460 }, // Responsive width
            minHeight: { xs: 'auto', sm: 540 },
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
            background: isDark 
              ? 'rgba(17, 27, 43, 0.78)' 
              : 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(30px) saturate(120%)',
            
            // Specular reflection highlight on the bubble surface
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '4%',
              left: '8%',
              width: '40%',
              height: '18%',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 75%)',
              transform: 'rotate(-15deg)',
              pointerEvents: 'none',
              zIndex: 1,
            },

            // Iridescent soap-bubble outline highlight
            border: isDark 
              ? '1.5px solid rgba(255, 255, 255, 0.15)' 
              : '1.5px solid rgba(255, 255, 255, 0.3)',
            
            // Morphing bubble animation
            animation: `${bubbleMorph} 12s ease-in-out infinite`,
            
            // Bubble glow shadow
            boxShadow: isDark 
              ? '0 8px 32px 0 rgba(56, 123, 255, 0.15), inset 0 0 20px 0 rgba(255, 255, 255, 0.05), 0 0 15px rgba(168, 85, 247, 0.12)' 
              : '0 8px 32px 0 rgba(56, 123, 255, 0.08), inset 0 0 20px 0 rgba(255, 255, 255, 0.15), 0 0 15px rgba(168, 85, 247, 0.06)',
            
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px) scale(1.01)',
              boxShadow: isDark 
                ? '0 12px 40px 0 rgba(56, 123, 255, 0.22), inset 0 0 25px 0 rgba(255, 255, 255, 0.08), 0 0 20px rgba(168, 85, 247, 0.18)' 
                : '0 12px 40px 0 rgba(56, 123, 255, 0.12), inset 0 0 25px 0 rgba(255, 255, 255, 0.2), 0 0 20px rgba(168, 85, 247, 0.12)',
            },
          }}
        >
          {/* Pulsing Logo Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1, zIndex: 2 }}>
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

          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary', zIndex: 2 }}>
            {title}
          </Typography>
          <Box sx={{ width: '100%', zIndex: 2 }}>
            {children}
          </Box>
        </Card>
      </Box>
    </Container>
  );
}

export default FormCard;