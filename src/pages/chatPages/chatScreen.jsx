import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Menu,
  MenuItem,
  Button,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { db } from '../../db';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { socket } from '../../socket';
import { getUserById } from '../../services/userService';
import DeleteMessageDialog from '../../components/chat/DeleteMessageDialog';
import ImagePreviewDialog from '../../components/chat/ImagePreviewDialog';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Converts a File object to a base64 data URL string.
 */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * Converts a base64 data URL string to a Blob.
 */
const base64ToBlob = (base64) => {
  const [meta, data] = base64.split(',');
  const mime = meta.match(/:(.*?);/)[1];
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
};

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  // Image sharing state
  const [selectedImage, setSelectedImage] = useState(null); // { file, previewUrl }
  const [imageUrls, setImageUrls] = useState({}); // imageId -> blob URL cache
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
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

        // Load associated images from Dexie and build blob URL cache
        const imageIds = storedMessages
          .filter((m) => m.imageId)
          .map((m) => m.imageId);

        if (imageIds.length > 0) {
          const imageRecords = await db.chatImages
            .where('imageId')
            .anyOf(imageIds)
            .toArray();

          const urls = {};
          imageRecords.forEach((rec) => {
            urls[rec.imageId] = URL.createObjectURL(rec.blob);
          });
          setImageUrls((prev) => ({ ...prev, ...urls }));
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Cleanup blob URLs on conversation change
    return () => {
      setImageUrls((prev) => {
        Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
        return {};
      });
    };
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
    if (!conversationId || messages.length === 0 || !token || !currentUser) return;

    const fetchUnknownSenders = async () => {
      const uniqueSenders = [...new Set(messages.map(m => String(m.sender)))];
      const unknownSenders = uniqueSenders.filter(id =>
        id !== String(currentUser?._id) &&
        id !== 'system' &&
        !fetchedUserIds.current.has(id) &&
        !members[id]
      );

      if (unknownSenders.length === 0) return;

      // Mark them as fetched/fetching immediately to prevent duplicate requests
      unknownSenders.forEach(id => fetchedUserIds.current.add(id));

      try {
        const newMembersUpdates = {};
        await Promise.all(
          unknownSenders.map(async (senderId) => {
            try {
              const userData = await getUserById(senderId, token);
              newMembersUpdates[senderId] = {
                _id: userData._id,
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
  }, [messages, token, currentUser?._id, conversation?._id]);

  useEffect(() => {
    if (!conversation?._id) return;

    const joinActiveRoom = () => {
      socket.emit('joinRoom', conversation._id);
      console.log('🔄 Rejoined active chat room on connect/reconnect:', conversation._id);
    };

    // Join room immediately on mount/conversation change
    joinActiveRoom();

    // Rejoin the room if the socket connection connects/reconnects
    socket.on('connect', joinActiveRoom);

    const handleNewMessage = async (message) => {
      if (message.conversationId === conversation._id) {
        // If the incoming message has image data, store the blob in Dexie
        if (message.imageData && message.imageId) {
          try {
            const blob = base64ToBlob(message.imageData);
            await db.chatImages.add({
              imageId: message.imageId,
              conversationId: message.conversationId,
              blob,
            });
            const blobUrl = URL.createObjectURL(blob);
            setImageUrls((prev) => ({ ...prev, [message.imageId]: blobUrl }));
          } catch (err) {
            console.error('Failed to store received image:', err);
          }
        }

        // Strip imageData before storing in state (we have it in Dexie already)
        const { imageData, ...msgWithoutData } = message;

        // Also store the received message in Dexie
        try {
          const id = await db.messages.add(msgWithoutData);
          msgWithoutData.id = id;
        } catch (err) {
          console.error('Failed to store received message in Dexie:', err);
        }

        setMessages((prev) => {
          if (prev.some(m => m.timestamp === msgWithoutData.timestamp && m.sender === msgWithoutData.sender)) {
            return prev;
          }
          return [...prev, msgWithoutData];
        });
      }
    };

    const handleMessageDeleted = (data) => {
      if (data.conversationId === conversation._id) {
        setMessages((prev) => prev.filter((msg) => !(msg.timestamp === data.timestamp && msg.sender === data.sender)));
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageDeleted', handleMessageDeleted);

    return () => {
      socket.off('connect', joinActiveRoom);
      socket.emit('leaveRoom', conversation._id);
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDeleted', handleMessageDeleted);
    };
  }, [conversation]);

  if (!currentUser) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
          bgcolor: 'background.default',
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

  // Image selection handler
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP).');
      return;
    }
    // Validate size
    if (file.size > MAX_IMAGE_SIZE) {
      alert('Image is too large. Maximum size is 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage({ file, previewUrl });

    // Reset the input so the same file can be re-selected
    e.target.value = '';
  };

  const clearSelectedImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
  };

  const openImagePreview = (src) => {
    setPreviewImageSrc(src);
    setPreviewDialogOpen(true);
  };

  const closeImagePreview = () => {
    setPreviewDialogOpen(false);
    setPreviewImageSrc(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const hasText = newMessage.trim();
    const hasImage = !!selectedImage;

    if ((hasText || hasImage) && conversation?._id) {
      const newMsg = {
        conversationId: conversation._id,
        text: newMessage,
        sender: currentUser._id,
        timestamp: new Date().toISOString(),
      };

      let imageBase64 = null;

      // If an image is attached, process and store it
      if (hasImage) {
        const imageId = crypto.randomUUID();
        newMsg.imageId = imageId;

        try {
          imageBase64 = await fileToBase64(selectedImage.file);
          const blob = selectedImage.file;

          // Store image blob in Dexie
          await db.chatImages.add({
            imageId,
            conversationId: conversation._id,
            blob,
          });

          // Cache the blob URL for rendering
          const blobUrl = URL.createObjectURL(blob);
          setImageUrls((prev) => ({ ...prev, [imageId]: blobUrl }));
        } catch (err) {
          console.error('Failed to store image:', err);
        }
      }

      // Send via socket — include base64 image data for the recipient
      const socketMsg = { ...newMsg };
      if (imageBase64) {
        socketMsg.imageData = imageBase64;
      }
      socket.emit('sendMessage', socketMsg);

      // Store message in Dexie (without the base64 data)
      const messageId = await db.messages.add(newMsg);
      const msgWithId = { ...newMsg, id: messageId };
      setMessages((prev) => [...prev, msgWithId]);
      setNewMessage('');
      clearSelectedImage();
    }
  };

  const handleMenuClick = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSelectedMessage(null);
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;
    try {
      if (selectedMessage.id) {
        await db.messages.delete(selectedMessage.id);
      } else {
        const toDelete = await db.messages
          .where('timestamp')
          .equals(selectedMessage.timestamp)
          .and(m => m.sender === selectedMessage.sender)
          .first();
        if (toDelete) {
          await db.messages.delete(toDelete.id);
        }
      }

      // Also delete the associated image from Dexie if it exists
      if (selectedMessage.imageId) {
        try {
          const imgRecord = await db.chatImages
            .where('imageId')
            .equals(selectedMessage.imageId)
            .first();
          if (imgRecord) {
            await db.chatImages.delete(imgRecord.id);
          }
          // Revoke and remove the cached blob URL
          if (imageUrls[selectedMessage.imageId]) {
            URL.revokeObjectURL(imageUrls[selectedMessage.imageId]);
            setImageUrls((prev) => {
              const updated = { ...prev };
              delete updated[selectedMessage.imageId];
              return updated;
            });
          }
        } catch (err) {
          console.error('Failed to delete associated image:', err);
        }
      }

      socket.emit('deleteMessage', {
        conversationId: conversation._id,
        sender: selectedMessage.sender,
        timestamp: selectedMessage.timestamp,
        text: selectedMessage.text,
      });

      setMessages((prev) =>
        prev.filter((msg) => !(msg.timestamp === selectedMessage.timestamp && msg.sender === selectedMessage.sender))
      );
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
    closeDeleteConfirm();
  };


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
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: String(msg.sender) === String(currentUser._id) ? 'flex-end' : 'flex-start',
              mb: 2,
              '&:hover .message-actions': { opacity: 1 },
            }}
            onMouseEnter={() => setHoveredMessageId(msg.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ mx: 1 }}>
                {getSenderInfo(msg.sender)?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimestamp(msg.timestamp)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              {String(msg.sender) === String(currentUser._id) && (
                <Box
                  className="message-actions"
                  sx={{
                    opacity: hoveredMessageId === msg.id ? 1 : 0,
                    transition: 'opacity 0.2s',
                    mr: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, msg)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}


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
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                }}
              >
                {/* Render image if message has one */}
                {msg.imageId && imageUrls[msg.imageId] && (
                  <Box
                    component="img"
                    src={imageUrls[msg.imageId]}
                    alt="Shared image"
                    onClick={() => openImagePreview(imageUrls[msg.imageId])}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 280,
                      borderRadius: 2,
                      cursor: 'pointer',
                      display: 'block',
                      mb: msg.text ? 1 : 0,
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 0.85 },
                    }}
                  />
                )}
                {msg.text && <Typography variant="body1">{msg.text}</Typography>}
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

      {/* Image Preview Strip (shown when an image is selected) */}
      {selectedImage && (
        <Box
          sx={{
            px: 2,
            py: 1,
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            component="img"
            src={selectedImage.previewUrl}
            alt="Selected image preview"
            onClick={() => openImagePreview(selectedImage.previewUrl)}
            sx={{
              width: 64,
              height: 64,
              objectFit: 'cover',
              borderRadius: 2,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: 'primary.main',
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1, ml: 1 }}>
            Image ready to send
          </Typography>
          <IconButton size="small" onClick={clearSelectedImage} color="error">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

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
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          ref={fileInputRef}
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        <IconButton
          color="primary"
          sx={{ p: '10px' }}
          onClick={() => fileInputRef.current?.click()}
          title="Attach image"
        >
          <AttachFileIcon />
        </IconButton>
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

      {/* Message Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={openDeleteConfirm} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete Message
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <DeleteMessageDialog
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteMessage}
      />

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        open={previewDialogOpen}
        onClose={closeImagePreview}
        imageSrc={previewImageSrc}
      />
    </Box>
  );
}

export default ChatScreen;
