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
    border-radius: 50% 50% 48% 52% / 50% 48% 52% 50%;
  }
  33% {
    border-radius: 48% 52% 50% 50% / 52% 50% 48% 50%;
  }
  66% {
    border-radius: 52% 48% 52% 48% / 48% 52% 50% 52%;
  }
  100% {
    border-radius: 50% 50% 48% 52% / 50% 48% 52% 50%;
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: 360, sm: 520 },
            height: { xs: 360, sm: 520 },
            borderRadius: '50%',
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
            p: { xs: 4, sm: 7 },

            // Premium radial-gradient matching a 3D spherical light source
            background: isDark
              ? 'radial-gradient(circle at 30% 30%, rgba(21, 38, 70, 0.9) 0%, rgba(8, 15, 30, 0.96) 80%)'
              : 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(224, 235, 255, 0.95) 85%)',

            backdropFilter: 'blur(30px) saturate(130%)',

            // Specular reflection highlights for glossy glass/bubble look
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '8%',
              left: '12%',
              width: '35%',
              height: '18%',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 75%)',
              transform: 'rotate(-25deg)',
              pointerEvents: 'none',
              zIndex: 1,
            },

            // Lower counter-light reflection highlight
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '8%',
              right: '12%',
              width: '25%',
              height: '12%',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 75%)',
              transform: 'rotate(35deg)',
              pointerEvents: 'none',
              zIndex: 1,
            },

            // Soap-bubble outline highlight (iridescent effect)
            border: isDark
              ? '1.5px solid rgba(152, 217, 255, 0.25)'
              : '1.5px solid rgba(56, 123, 255, 0.35)',

            // Morphing bubble animation
            animation: `${bubbleMorph} 15s ease-in-out infinite`,

            // Spherical 3D glow shadow
            boxShadow: isDark
              ? 'inset 10px 10px 30px rgba(255, 255, 255, 0.08), inset -15px -15px 35px rgba(0, 0, 0, 0.65), 0 12px 40px rgba(56, 123, 255, 0.22), 0 0 25px rgba(168, 85, 247, 0.15)'
              : 'inset 10px 10px 25px rgba(255, 255, 255, 0.6), inset -15px -15px 35px rgba(56, 123, 255, 0.12), 0 12px 40px rgba(56, 123, 255, 0.12), 0 0 25px rgba(168, 85, 247, 0.08)',

            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: isDark
                ? 'inset 12px 12px 35px rgba(255, 255, 255, 0.12), inset -18px -18px 40px rgba(0, 0, 0, 0.75), 0 16px 50px rgba(56, 123, 255, 0.3), 0 0 35px rgba(168, 85, 247, 0.22)'
                : 'inset 12px 12px 30px rgba(255, 255, 255, 0.8), inset -18px -18px 40px rgba(56, 123, 255, 0.18), 0 16px 50px rgba(56, 123, 255, 0.2), 0 0 35px rgba(168, 85, 247, 0.12)',
            },
          }}
        >
          {/* Constrain child content inside the circular bounds */}
          <Box sx={{ width: '78%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            {/* Pulsing Logo Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
              <BubbleChartIcon
                sx={{
                  color: 'primary.main',
                  fontSize: 34,
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

            <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
              {title}
            </Typography>

            <Box sx={{ width: '100%' }}>
              {children}
            </Box>
          </Box>
        </Card>
      </Box>
    </Container>
  );
}

export default FormCard;

