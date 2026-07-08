import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { db } from '../../db';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { socket } from '../../socket';

const emptyPlaceholder = [
  { id: 1, text: 'Select a conversation to see messages here.', sender: 'system', timestamp: '' },
];

function ChatScreen({ conversation, onBack }) {
  const [messages, setMessages] = useState(emptyPlaceholder);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currentUser = useSelector(selectCurrentUser);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const conversationId = conversation?._id;

    if (!conversationId) {
      setMessages(emptyPlaceholder);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      try {
        const storedMessages = await db.messages
          .where('conversationId')
          .equals(conversationId)
          .sortBy('timestamp');

        setMessages(storedMessages.length > 0 ? storedMessages : []);
      } catch (error) {
        console.error("Failed to load messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversation?._id) return;

    socket.emit('joinRoom', conversation._id);

    const handleNewMessage = async (message) => {
      if (message.conversationId === conversation._id) {
        await db.messages.add(message);
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.emit('leaveRoom', conversation._id);
      socket.off('newMessage', handleNewMessage);
    };
  }, [conversation]);

  if (!conversation) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Avatar src={getImageUrl(currentUser?.profilePic)} sx={{ width: 120, height: 120 }} />
        <Typography variant="h5">Welcome, {currentUser?.username || 'User'}!</Typography>
        <Typography variant="h6" color="text.secondary">Select a bubble to start chatting</Typography>
      </Box>
    );
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && conversation?._id) {
      const newMsg = {
        conversationId: conversation._id,
        text: newMessage,
        sender: currentUser._id,
        timestamp: new Date().toISOString(),
      };

      socket.emit('sendMessage', newMsg);

      await db.messages.add(newMsg);
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
    }
  };

  const conversationType = conversation?.type || 'Chat';
  const placeholderText = conversation?.type === 'Group'
    ? `Send a message to ${conversation.name} bubble...`
    : `Message ${conversation.name}...`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        flexGrow: 1,
      }}
    >
      {/* Chat Header */}
      <AppBar position="static" color="default" sx={{ boxShadow: 'none', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Toolbar sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, py: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Avatar alt={conversation.name} src={getImageUrl(conversation.profilePic)} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h6">{conversation.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {conversationType}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Message Display Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'background.default',
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === currentUser._id ? 'flex-end' : 'flex-start',
              mb: 2,
              alignItems: 'center', // Align items vertically
            }}
          >
            {msg.sender !== currentUser._id && (
              <Avatar
                alt={conversation.name}
                src={getImageUrl(conversation.profilePic)}
                sx={{ mr: 1.5 }}
              />
            )}
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                bgcolor: msg.sender === currentUser._id ? 'primary.main' : 'background.paper',
                color: msg.sender === currentUser._id ? 'primary.contrastText' : 'text.primary',
                borderRadius: msg.sender === currentUser._id ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                maxWidth: '70%',
              }}
            >
              <Typography variant="body1">{msg.text}</Typography>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.7, mt: 0.5 }}>
                {msg.timestamp}
              </Typography>
            </Paper>
            {msg.sender === currentUser._id && (
              <Avatar
                alt={currentUser.username}
                src={getImageUrl(currentUser.profilePic)}
                sx={{ ml: 1.5 }}
              />
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: 0,
        }}
      >
        <TextField
          fullWidth
          variant="standard"
          placeholder={placeholderText}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          autoComplete="off"
          sx={{ ml: 1, flex: 1 }}
          InputProps={{ disableUnderline: true }}
        />
        <IconButton type="submit" color="primary" sx={{ p: '10px' }}>
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}

export default ChatScreen;
