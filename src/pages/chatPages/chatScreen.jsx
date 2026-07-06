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

const initialMessages = [
  { id: 1, text: 'Hey! How are you?', sender: 'other', timestamp: '10:00 AM' },
  { id: 2, text: 'I am good, thanks! How about you?', sender: 'me', timestamp: '10:01 AM' },
  { id: 3, text: 'Doing great. Are we still on for tomorrow?', sender: 'other', timestamp: '10:01 AM' },
  { id: 4, text: 'Yes, absolutely! Looking forward to it.', sender: 'me', timestamp: '10:02 AM' },
];

function ChatScreen({ conversation, onBack }) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

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
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Avatar alt={conversation.name} src={conversation.profilePic} sx={{ mr: 2 }} />
          <Typography variant="h6">{conversation.name}</Typography>
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
              justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                bgcolor: msg.sender === 'me' ? 'primary.main' : 'background.paper',
                color: msg.sender === 'me' ? 'primary.contrastText' : 'text.primary',
                borderRadius: msg.sender === 'me' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                maxWidth: '70%',
              }}
            >
              <Typography variant="body1">{msg.text}</Typography>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.7, mt: 0.5 }}>
                {msg.timestamp}
              </Typography>
            </Paper>
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
          placeholder="Type a message..."
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
