import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './sidebar';
import ChatScreen from './chatScreen';
import { db } from '../../db';
import { selectCurrentUser, fetchUserCommunities } from '../../store/slices/authSlice';
import { getUserById } from '../../services/userService';
import { socket } from '../../socket';

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
  const location = useLocation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const token = useSelector((state) => state.auth.token);

  // On mount, check for location consent. If not granted, redirect to the location page.
  useEffect(() => {
    const consentStatus = localStorage.getItem('locationConsent');
    if (consentStatus === null) {
      navigate('/location');
    }
  }, [navigate]);

  // Manage socket connection lifecycle & global background message receiver
  useEffect(() => {
    if (token && currentUser?._id) {
      // Set token for authentication handshake
      socket.auth = { token };
      
      // Connect to the socket server
      socket.connect();
      console.log('🔌 Socket connecting...');

      socket.on('connect', () => {
        console.log('⚡ Socket connected successfully!');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
      });

      // Global receiver to store incoming messages to IndexedDB in the background
      const handleGlobalNewMessage = async (message) => {
        try {
          // Check if message exists to prevent duplicates
          const exists = await db.messages
            .where('timestamp')
            .equals(message.timestamp)
            .and(m => m.sender === message.sender)
            .first();

          if (!exists) {
            await db.messages.add({
              conversationId: message.conversationId,
              text: message.text,
              sender: message.sender,
              timestamp: message.timestamp
            });
            console.log('📩 Message saved to local database globally:', message.text);
          }

          // If it's a DM, verify the local conversation exists so the chat displays in the sidebar
          if (message.conversationId && message.conversationId.startsWith('dm_')) {
            let conversation = await db.conversations.where('conversationId').equals(message.conversationId).first();
            if (!conversation) {
              const parts = message.conversationId.replace('dm_', '').split('_');
              const otherUserId = parts.find(id => id !== currentUser._id.toString());
              
              if (otherUserId) {
                const otherUser = await getUserById(otherUserId, token);
                const newConv = {
                  conversationId: message.conversationId,
                  _id: message.conversationId,
                  name: otherUser.username,
                  type: 'DM',
                  members: [
                    { _id: currentUser._id, username: currentUser.username, profilePic: currentUser.profilePic },
                    { _id: otherUser._id, username: otherUser.username, profilePic: otherUser.profilePic }
                  ]
                };
                await db.conversations.add(newConv);
                console.log('👥 Created local conversation for incoming DM:', otherUser.username);
                // Refresh sidebar lists
                dispatch(fetchUserCommunities());
              }
            }
          }
        } catch (err) {
          console.error('Failed to handle incoming message globally:', err);
        }
      };

      socket.on('newMessage', handleGlobalNewMessage);

      return () => {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('newMessage', handleGlobalNewMessage);
        socket.disconnect();
        console.log('🔌 Socket disconnected.');
      };
    }
  }, [token, currentUser, dispatch]);

  // Intercept DMs initialized from Profile redirect
  useEffect(() => {
    const checkPendingDM = async () => {
      if (location.state?.startDMWith && currentUser?._id) {
        const friend = location.state.startDMWith;
        const dmConversationId = `dm_${[currentUser._id, friend._id].sort().join('_')}`;
        
        try {
          let conversation = await db.conversations.where('conversationId').equals(dmConversationId).first();
          if (!conversation) {
            conversation = {
              conversationId: dmConversationId,
              _id: dmConversationId,
              name: friend.username,
              type: 'DM',
              members: [
                { _id: currentUser._id, username: currentUser.username, profilePic: currentUser.profilePic },
                { _id: friend._id, username: friend.username, profilePic: friend.profilePic }
              ]
            };
            await db.conversations.add(conversation);
          }
          
          setSelectedConversation(conversation);
          
          // Clear state so that it doesn't open the DM again on reload or back navigation
          navigate('/chat', { replace: true, state: null });
        } catch (err) {
          console.error('Failed to initialize DM from profile redirect:', err);
        }
      }
    };

    checkPendingDM();
  }, [location.state, currentUser, navigate]);

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
