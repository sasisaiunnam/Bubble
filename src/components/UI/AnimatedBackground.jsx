import React from 'react';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';

// Define the keyframes for the animation
const animate = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-1000px) rotate(720deg);
    opacity: 0;
  }
`;

// Create a styled component for the <ul> container
const BackgroundContainer = styled('ul')(({ theme }) => ({
  position: 'fixed',
  width: '100vw',
  height: '100vh',
  top: 0,
  left: 0,
  margin: 0,
  padding: 0,
  background:
    theme.palette.mode === 'dark' // Make the ellipse much wider than the screen and fade out more gradually
      ? `radial-gradient(ellipse 150% 50% at 50% 100%, ${theme.palette.primary.dark} 0%, transparent 70%)`
      : 'transparent',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
  zIndex: -1, // Place it behind all other content
}));

// Create a styled component for the <li> bubbles
const Bubble = styled('li')(({ theme }) => ({
  position: 'absolute',
  display: 'block',
  listStyle: 'none',
  width: '20px',
  height: '20px',
  // Dynamically set the background based on the theme mode
  background:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : `rgba(98, 0, 234, 0.15)`, // A semi-transparent version of your light theme's primary color
  animation: `${animate} 25s linear infinite`,
  bottom: '-150px',
  borderRadius: '50%',
  backdropFilter: 'blur(2px)',

  '&:nth-of-type(1)': {
    left: '25%',
    width: '80px',
    height: '80px',
    animationDelay: '0s',
  },
  '&:nth-of-type(2)': {
    left: '10%',
    width: '20px',
    height: '20px',
    animationDelay: '2s',
    animationDuration: '12s',
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : `rgba(3, 218, 198, 0.15)`, // Use secondary color
  },
  '&:nth-of-type(3)': {
    left: '70%',
    width: '20px',
    height: '20px',
    animationDelay: '4s',
  },
  '&:nth-of-type(4)': {
    left: '40%',
    width: '60px',
    height: '60px',
    animationDelay: '0s',
    animationDuration: '18s',
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : `rgba(3, 218, 198, 0.15)`, // Use secondary color
  },
  '&:nth-of-type(5)': { left: '65%', width: '20px', height: '20px', animationDelay: '0s' },
  '&:nth-of-type(6)': { left: '75%', width: '110px', height: '110px', animationDelay: '3s' },
  '&:nth-of-type(7)': { left: '35%', width: '150px', height: '150px', animationDelay: '7s' },
  '&:nth-of-type(8)': {
    left: '50%',
    width: '25px',
    height: '25px',
    animationDelay: '15s',
    animationDuration: '45s',
  },
  '&:nth-of-type(9)': {
    left: '20%',
    width: '15px',
    height: '15px',
    animationDelay: '2s',
    animationDuration: '35s',
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : `rgba(3, 218, 198, 0.15)`, // Use secondary color
  },
  '&:nth-of-type(10)': {
    left: '85%',
    width: '150px',
    height: '150px',
    animationDelay: '0s',
    animationDuration: '11s',
  },
}));

const AnimatedBackground = () => {
  return (
    <BackgroundContainer>
      {[...Array(10)].map((_, i) => (
        <Bubble key={i} />
      ))}
    </BackgroundContainer>
  );
};

export default AnimatedBackground;