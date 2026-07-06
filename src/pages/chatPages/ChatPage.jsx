import React, { useState } from 'react';
import { Box, CssBaseline, useTheme, useMediaQuery, Typography } from '@mui/material';
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
        {/* On mobile, ChatScreen is only rendered when a convo is selected. On desktop, it's always there. */}
        {selectedConversation && <ChatScreen conversation={selectedConversation} onBack={handleBack} />}
      </Box>
    </Box>
  );
}

export default ChatPage;
