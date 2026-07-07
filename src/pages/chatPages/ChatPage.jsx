import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, useTheme, useMediaQuery, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import ChatScreen from './chatScreen';

/**
 * ChatPage component integrates the Sidebar and ChatScreen to create
 * the main chat interface of the application.
 * It handles responsive layout for mobile and desktop.
 */
function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // On mount, check for location consent. If not granted, redirect to the location page.
  useEffect(() => {
    const consentStatus = localStorage.getItem('locationConsent');
    if (consentStatus === null) {
      navigate('/location');
    }
  }, [navigate]);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <Box
        component="aside"
        sx={{
          display: { xs: selectedConversation ? 'none' : 'block', sm: 'block' },
        }}
      >
        <Sidebar onConversationSelect={handleConversationSelect} />
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: { xs: selectedConversation ? 'block' : 'none', sm: 'block' },
        }}
      >
        {/* On mobile, ChatScreen is only visible after a selection. On desktop, a placeholder shows until a conversation is chosen. */}
        <ChatScreen conversation={selectedConversation} onBack={handleBack} />
      </Box>
    </Box>
  );
}

export default ChatPage;
