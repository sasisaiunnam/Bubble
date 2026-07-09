import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Link,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { db } from '../../db';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { socket } from '../../socket';
import { getUserById } from '../../services/userService';

const emptyPlaceholder = [
  { id: 1, text: 'Select a conversation to see messages here.', sender: 'system', timestamp: '' },
];

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function ChatScreen({ conversation, onBack }) {
  const [messages, setMessages] = useState(emptyPlaceholder);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currentUser = useSelector(selectCurrentUser);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const [members, setMembers] = useState({});
  const fetchedUserIds = useRef(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const conversationId = conversation?._id;

    if (!conversationId) {
      setMessages(emptyPlaceholder);
      return;
    }

    // Create a map of members for easy lookup if it's a group chat
    if (conversation.type === 'Group' && conversation.members) {
      const membersMap = conversation.members.reduce((acc, member) => {
        acc[member._id] = member;
        return acc;
      }, {});
      setMembers(membersMap);
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

  // Reset the fetched set and members when the conversation changes
  useEffect(() => {
    fetchedUserIds.current = new Set();
    setMembers({});
  }, [conversation?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch profiles of senders who are not in the members cache (unknown users)
  useEffect(() => {
    const conversationId = conversation?._id;
    if (!conversationId || messages.length === 0 || !token) return;

    const fetchUnknownSenders = async () => {
      const uniqueSenders = [...new Set(messages.map(m => String(m.sender)))];
      const unknownSenders = uniqueSenders.filter(id => 
        id !== String(currentUser._id) && 
        id !== 'system' && 
        !fetchedUserIds.current.has(id) && 
        !members[id]
      );

      if (unknownSenders.length === 0) return;

      // Mark them as fetched/fetching immediately to prevent duplicate requests
      unknownSenders.forEach(id => fetchedUserIds.current.add(id));

      const newMembersUpdates = {};
      try {
        await Promise.all(
          unknownSenders.map(async (senderId) => {
            try {
              const userData = await getUserById(senderId, token);
              newMembersUpdates[senderId] = {
                _id: senderId,
                username: userData.username,
                profilePic: userData.profilePic
              };
            } catch (err) {
              console.error(`Failed to fetch user info for sender ${senderId}:`, err);
              newMembersUpdates[senderId] = {
                _id: senderId,
                username: 'Unknown User',
                profilePic: null
              };
            }
          })
        );

        if (Object.keys(newMembersUpdates).length > 0) {
          setMembers(prev => ({
            ...prev,
            ...newMembersUpdates
          }));
        }
      } catch (err) {
        console.error('Error fetching unknown senders:', err);
      }
    };

    fetchUnknownSenders();
  }, [messages, token, currentUser._id, conversation?._id]);

  useEffect(() => {
    if (!conversation?._id) return;

    socket.emit('joinRoom', conversation._id);

    const handleNewMessage = (message) => {
      if (message.conversationId === conversation._id) {
        setMessages((prev) => {
          if (prev.some(m => m.timestamp === message.timestamp && m.sender === message.sender)) {
            return prev;
          }
          return [...prev, message];
        });
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

  const conversations = db.conversations.toArray();
  console.log(conversations);

  const conversationType = conversation?.type || 'Chat';
  const placeholderText = conversation?.type === 'Group'
    ? `Send a message to ${conversation.name} bubble...`
    : `Message ${conversation.name}...`;

  const getSenderInfo = (senderId) => {
    const id = String(senderId);

    if (id === String(currentUser._id)) {
      return currentUser;
    }

    if (conversation.type === "DM") {
      return (
        conversation.members.find(
          (m) => String(m._id) === id
        ) || {
          username: "Unknown User",
          profilePic: null,
        }
      );
    }

    return (
      members[id] || {
        username: "Unknown User",
        profilePic: null,
      }
    );
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
        <Toolbar sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, py: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            {conversation.type === 'DM' && conversation.members ? (
              <Link
                component="button"
                onClick={() => {
                  const otherMember = conversation.members.find(m => String(m._id) !== String(currentUser._id));
                  if (otherMember) navigate(`/user/${otherMember._id}`);
                }}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'contents',
                }}
              >
                <Avatar alt={conversation.name} src={getImageUrl(conversation.members.find(m => m._id !== currentUser._id)?.profilePic)} sx={{ mr: 2, cursor: 'pointer' }} />
              </Link>
            ) : (
              <Avatar alt={conversation.name} src={getImageUrl(conversation.profilePic)} sx={{ mr: 2 }} />
            )}
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
              flexDirection: 'column',
              alignItems: String(msg.sender) === String(currentUser._id) ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ mx: 1 }}>
                {getSenderInfo(msg.sender)?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimestamp(msg.timestamp)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {String(msg.sender) !== String(currentUser._id) && (
                <RouterLink to={`/user/${msg.sender}`}>
                  <Avatar
                    alt={getSenderInfo(msg.sender)?.username}
                    src={getImageUrl(getSenderInfo(msg.sender)?.profilePic)}
                    sx={{ mr: 1.5, cursor: 'pointer' }}
                  />
                </RouterLink>
              )}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: String(msg.sender) === String(currentUser._id) ? 'primary.main' : 'background.paper',
                  color: String(msg.sender) === String(currentUser._id) ? 'primary.contrastText' : 'text.primary',
                  borderRadius: String(msg.sender) === String(currentUser._id) ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                  maxWidth: '70%',
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Paper>
              {msg.sender === currentUser._id && (
                <RouterLink to={`/user/${currentUser._id}`}>
                  <Avatar
                    alt={currentUser.username}
                    src={getImageUrl(currentUser.profilePic)}
                    sx={{ ml: 1.5, cursor: 'pointer' }}
                  />
                </RouterLink>
              )}
            </Box>
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
