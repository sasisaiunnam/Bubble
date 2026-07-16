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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { db } from '../../db';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, fetchUserCommunities } from '../../store/slices/authSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { socket } from '../../socket';
import { getUserById } from '../../services/userService';
import { deleteCommunity } from '../../services/communitySevice';
import DeleteMessageDialog from '../../components/chat/DeleteMessageDialog';
import ImagePreviewDialog from '../../components/chat/ImagePreviewDialog';
import CalendarDrawer from '../../components/chat/CalendarDrawer';

// Material-UI Icons for professional real-world UI
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaletteIcon from '@mui/icons-material/Palette';
import CastleIcon from '@mui/icons-material/Castle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShieldIcon from '@mui/icons-material/Shield';
import ExploreIcon from '@mui/icons-material/Explore';

// Import Anime Theme backgrounds
import animeSakura from '../../assets/anime_sakura.png';
import animeLofi from '../../assets/anime_lofi.png';
import animeCyberpunk from '../../assets/anime_cyberpunk.png';
import animeSky from '../../assets/anime_sky.png';

const ANIME_THEMES = {
  sakura: {
    name: 'Floating Ruins',
    icon: <CastleIcon />,
    wallpaper: animeSakura,
    bubbleSender: {
      background: 'linear-gradient(135deg, #FFE3E8 0%, #FFCAD4 100%)',
      color: '#5C1D2A',
      border: '2.5px solid #FF9EAE',
      boxShadow: '4px 4px 0px rgba(255, 158, 174, 0.4)',
    },
    bubbleReceiver: {
      background: '#FFF0F3',
      color: '#5C1D2A',
      border: '2.5px solid #FFB3C1',
      boxShadow: '4px 4px 0px rgba(255, 179, 193, 0.3)',
    },
    textColor: '#5C1D2A',
    particleType: 'sakura',
    headerBg: 'rgba(255, 230, 235, 0.85)',
    inputBg: 'rgba(255, 240, 243, 0.9)',
    avatarBorder: '#FFB3C1',
    tailColorSender: '#FFCAD4',
    tailColorReceiver: '#FFF0F3',
  },
  cyberpunk: {
    name: 'Sword Sanctuary',
    icon: <AutoAwesomeIcon />,
    wallpaper: animeCyberpunk,
    bubbleSender: {
      background: 'linear-gradient(135deg, #1A0033 0%, #330066 100%)',
      color: '#00FFFF',
      border: '2.5px solid #FF00FF',
      boxShadow: '0 0 10px rgba(255, 0, 255, 0.6)',
      textShadow: '0 0 4px rgba(0, 255, 255, 0.3)',
    },
    bubbleReceiver: {
      background: '#080815',
      color: '#FF00FF',
      border: '2.5px solid #00FFFF',
      boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)',
      textShadow: '0 0 4px rgba(255, 0, 255, 0.3)',
    },
    textColor: '#FFFFFF',
    particleType: 'neon',
    headerBg: 'rgba(10, 10, 20, 0.85)',
    inputBg: 'rgba(15, 15, 30, 0.9)',
    avatarBorder: '#00FFFF',
    tailColorSender: '#330066',
    tailColorReceiver: '#080815',
  },
  lofi: {
    name: 'Guild Tavern',
    icon: <ShieldIcon />,
    wallpaper: animeLofi,
    bubbleSender: {
      background: 'linear-gradient(135deg, #F5E6D3 0%, #E6D5C3 100%)',
      color: '#4A3E3D',
      border: '2.5px solid #CDBFA8',
      boxShadow: '4px 4px 0px rgba(163, 145, 131, 0.3)',
    },
    bubbleReceiver: {
      background: '#FCF9F5',
      color: '#4A3E3D',
      border: '2.5px solid #E6DFD3',
      boxShadow: '4px 4px 0px rgba(163, 145, 131, 0.15)',
    },
    textColor: '#4A3E3D',
    particleType: 'coffee',
    headerBg: 'rgba(240, 230, 218, 0.85)',
    inputBg: 'rgba(252, 249, 245, 0.9)',
    avatarBorder: '#CDBFA8',
    tailColorSender: '#E6D5C3',
    tailColorReceiver: '#FCF9F5',
  },
  sky: {
    name: 'Steampunk Airship',
    icon: <ExploreIcon />,
    wallpaper: animeSky,
    bubbleSender: {
      background: 'linear-gradient(135deg, #E6EEFF 0%, #CCD9FF 100%)',
      color: '#1A2E5C',
      border: '2.5px solid #B0C4FF',
      boxShadow: '4px 4px 0px rgba(176, 196, 255, 0.4)',
    },
    bubbleReceiver: {
      background: '#F5F8FF',
      color: '#1A2E5C',
      border: '2.5px solid #E0E8FF',
      boxShadow: '4px 4px 0px rgba(224, 232, 255, 0.3)',
    },
    textColor: '#1A2E5C',
    particleType: 'stars',
    headerBg: 'rgba(230, 235, 250, 0.85)',
    inputBg: 'rgba(245, 248, 255, 0.9)',
    avatarBorder: '#B0C4FF',
    tailColorSender: '#CCD9FF',
    tailColorReceiver: '#F5F8FF',
  },
};

const renderParticles = (type) => {
  const count = 15;
  const particles = [];
  for (let i = 0; i < count; i++) {
    const left = (i / count) * 100 + (Math.random() * 5 - 2.5);
    const delay = Math.random() * 8;
    const duration = 6 + Math.random() * 8;
    const size = type === 'neon' ? 1 : 10 + Math.random() * 15;
    
    let particleStyle = {
      position: 'absolute',
      left: `${left}%`,
      bottom: '-25px',
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear',
      pointerEvents: 'none',
    };

    if (type === 'sakura') {
      particles.push(
        <Box
          key={i}
          sx={{
            ...particleStyle,
            animationName: 'floatSakura',
            borderRadius: '50% 0 50% 50%',
            background: 'linear-gradient(135deg, #FFB7B2 0%, #FFDAC1 100%)',
            transform: 'rotate(-45deg)',
          }}
        />
      );
    } else if (type === 'coffee') {
      particles.push(
        <Box
          key={i}
          sx={{
            ...particleStyle,
            animationName: 'floatBubble',
            borderRadius: '50%',
            background: 'rgba(227, 213, 202, 0.2)',
            border: '1.5px solid rgba(163, 145, 131, 0.35)',
          }}
        />
      );
    } else if (type === 'neon') {
      const isCyan = Math.random() > 0.5;
      particles.push(
        <Box
          key={i}
          sx={{
            ...particleStyle,
            top: '-40px',
            bottom: 'auto',
            width: '2px',
            height: `${30 + Math.random() * 30}px`,
            animationName: 'neonRain',
            background: isCyan ? '#00FFFF' : '#FF00FF',
            boxShadow: isCyan ? '0 0 6px #00FFFF' : '0 0 6px #FF00FF',
          }}
        />
      );
    } else if (type === 'stars') {
      particles.push(
        <Box
          key={i}
          sx={{
            ...particleStyle,
            animationName: 'floatStar',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFE066',
            fontSize: `${size}px`,
            textShadow: '0 0 4px rgba(255, 224, 102, 0.6)',
          }}
        >
          ✦
        </Box>
      );
    }
  }
  return particles;
};



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

  const [animeTheme, setAnimeTheme] = useState(() => localStorage.getItem('animeTheme') || 'none');
  const themeConfig = ANIME_THEMES[animeTheme] || null;

  const cycleAnimeTheme = () => {
    const keys = ['none', 'sakura', 'cyberpunk', 'lofi', 'sky'];
    const nextIndex = (keys.indexOf(animeTheme) + 1) % keys.length;
    const nextTheme = keys[nextIndex];
    setAnimeTheme(nextTheme);
    localStorage.setItem('animeTheme', nextTheme);
  };

  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const syncPendingMessages = useCallback(async () => {
    if (!navigator.onLine || !socket.connected) return;
    try {
      const pending = await db.messages.where('isPending').equals(1).toArray();
      if (pending.length === 0) return;
      console.log(`🔄 Syncing ${pending.length} pending messages...`);

      for (const msg of pending) {
        if (!socket.connected) break;

        const socketMsg = {
          conversationId: msg.conversationId,
          text: msg.text,
          sender: msg.sender,
          timestamp: msg.timestamp,
        };

        if (msg.imageId) {
          socketMsg.imageId = msg.imageId;
          const imgRecord = await db.chatImages.where('imageId').equals(msg.imageId).first();
          if (imgRecord?.blob) {
            try {
              const base64 = await fileToBase64(imgRecord.blob);
              socketMsg.imageData = base64;
            } catch (err) {
              console.error('Failed to convert stored blob to base64 during sync:', err);
            }
          }
        }

        socket.emit('sendMessage', socketMsg);
        await db.messages.update(msg.id, { isPending: 0 });

        setMessages((prev) =>
          prev.map((m) =>
            m.timestamp === msg.timestamp && String(m.sender) === String(msg.sender)
              ? { ...m, isPending: 0 }
              : m
          )
        );
      }
      console.log('✅ Sync completed!');
    } catch (err) {
      console.error('Failed to sync pending messages:', err);
    }
  }, [conversation?._id]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingMessages();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      syncPendingMessages();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingMessages]);

  useEffect(() => {
    const handleConnect = () => {
      syncPendingMessages();
    };
    socket.on('connect', handleConnect);
    return () => {
      socket.off('connect', handleConnect);
    };
  }, [syncPendingMessages]);



  // Image sharing state
  const [selectedImage, setSelectedImage] = useState(null); // { file, previewUrl }
  const [imageUrls, setImageUrls] = useState({}); // imageId -> blob URL cache

  const [customWallpaperUrl, setCustomWallpaperUrl] = useState(null);
  const [wallpaperMenuAnchor, setWallpaperMenuAnchor] = useState(null);
  const wallpaperInputRef = useRef(null);

  // Load custom wallpaper on mount or conversation change
  useEffect(() => {
    if (!conversation?._id) {
      setCustomWallpaperUrl(null);
      return;
    }
    const loadCustomWallpaper = async () => {
      try {
        const record = await db.keyStore.get(`customWallpaper_${conversation._id}`);
        if (record?.value) {
          const url = URL.createObjectURL(record.value);
          setCustomWallpaperUrl(url);
        } else {
          setCustomWallpaperUrl(null);
        }
      } catch (err) {
        console.error('Failed to load custom wallpaper:', err);
      }
    };
    loadCustomWallpaper();

    return () => {
      setCustomWallpaperUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [conversation?._id]);

  const handleWallpaperUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversation?._id) return;
    try {
      await db.keyStore.put({
        keyName: `customWallpaper_${conversation._id}`,
        value: file,
      });

      if (customWallpaperUrl) {
        URL.revokeObjectURL(customWallpaperUrl);
      }

      const url = URL.createObjectURL(file);
      setCustomWallpaperUrl(url);
    } catch (err) {
      console.error('Failed to store custom wallpaper:', err);
    }
  };

  const handleRemoveWallpaper = async () => {
    if (!conversation?._id) return;
    try {
      await db.keyStore.delete(`customWallpaper_${conversation._id}`);
      if (customWallpaperUrl) {
        URL.revokeObjectURL(customWallpaperUrl);
      }
      setCustomWallpaperUrl(null);
    } catch (err) {
      console.error('Failed to remove custom wallpaper:', err);
    }
  };

  const [calendarOpen, setCalendarOpen] = useState(false);

  // Request browser notification permissions on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Poll IndexedDB for active reminders every 10 seconds
  useEffect(() => {
    if (!conversation?._id) return;

    const checkReminders = async () => {
      try {
        const now = Date.now();
        const due = await db.reminders
          .where('conversationId')
          .equals(conversation._id)
          .toArray();

        const activeDue = due.filter(
          (r) => r.timestamp <= now && r.isCompleted === 0
        );

        for (const rem of activeDue) {
          // Trigger standard browser notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('⏰ Bubble Reminder', {
              body: rem.title,
            });
          } else {
            alert(`⏰ Reminder: ${rem.title}`);
          }

          // Mark as completed
          await db.reminders.update(rem.id, { isCompleted: 1 });
        }
      } catch (err) {
        console.error('Failed to check due reminders:', err);
      }
    };

    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [conversation?._id]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState(null);
  const [headerMenuAnchor, setHeaderMenuAnchor] = useState(null);
  const [deleteCommunityConfirmOpen, setDeleteCommunityConfirmOpen] = useState(false);

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

  const handleDeleteCommunity = async () => {
    try {
      await deleteCommunity(conversation._id, token);
      dispatch(fetchUserCommunities());
      setDeleteCommunityConfirmOpen(false);
      setHeaderMenuAnchor(null);
      if (onBack) onBack();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete bubble");
    }
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

      const online = navigator.onLine && socket.connected;
      if (!online) {
        newMsg.isPending = 1;
      }

      // Store message in Dexie (without the base64 data)
      const messageId = await db.messages.add(newMsg);
      const msgWithId = { ...newMsg, id: messageId };
      setMessages((prev) => [...prev, msgWithId]);

      if (online) {
        // Send via socket — include base64 image data for the recipient
        const socketMsg = { ...newMsg };
        if (imageBase64) {
          socketMsg.imageData = imageBase64;
        }
        socket.emit('sendMessage', socketMsg);
      }

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
      {/* Dynamic Font Import and CSS animations for Anime Theme */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Nunito:wght@300..900&display=swap');
          
          @keyframes floatSakura {
            0% { transform: translateY(105vh) translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateY(-5vh) translateX(60px) rotate(270deg); opacity: 0; }
          }
          @keyframes floatStar {
            0% { transform: translateY(105vh) translateX(0) scale(0.8); opacity: 0; }
            15% { opacity: 0.9; }
            85% { opacity: 0.9; }
            100% { transform: translateY(-5vh) translateX(-40px) scale(1.2); opacity: 0; }
          }
          @keyframes floatBubble {
            0% { transform: translateY(105vh) scale(0.7); opacity: 0; }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            100% { transform: translateY(-5vh) scale(1.3); opacity: 0; }
          }
          @keyframes neonRain {
            0% { transform: translateY(-10vh) translateX(0); opacity: 0; }
            10% { opacity: 0.7; }
            90% { opacity: 0.7; }
            100% { transform: translateY(110vh) translateX(15px); opacity: 0; }
          }
          @keyframes bubblePopIn {
            0% { transform: scale(0.7) translateY(20px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          @keyframes animeBubbleBob1 {
            0% { transform: translateY(0px) rotate(0deg); }
            100% { transform: translateY(-6px) rotate(0.5deg); }
          }
          @keyframes animeBubbleBob2 {
            0% { transform: translateY(-1px) rotate(-0.5deg); }
            100% { transform: translateY(5px) rotate(0deg); }
          }
          @keyframes animeBubbleBob3 {
            0% { transform: translateY(3px) rotate(0deg); }
            100% { transform: translateY(-4px) rotate(-0.5deg); }
          }
        `}
      </style>

      {/* Chat Header */}
      <AppBar 
        position="static" 
        color="default" 
        sx={{ 
          boxShadow: 'none', 
          borderBottom: themeConfig ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
          background: themeConfig ? themeConfig.headerBg : 'default',
          backdropFilter: themeConfig ? 'blur(16px)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, py: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {isMobile && (
              <IconButton 
                edge="start" 
                color="inherit" 
                onClick={onBack} 
                sx={{ 
                  mr: 1,
                  color: themeConfig ? themeConfig.textColor : 'inherit',
                }}
              >
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
                <Avatar 
                  alt={conversation.name} 
                  src={getImageUrl(conversation.members.find(m => m._id !== currentUser._id)?.profilePic)} 
                  sx={{ 
                    mr: 2, 
                    cursor: 'pointer',
                    border: themeConfig ? `2px solid ${themeConfig.avatarBorder}` : 'none',
                    boxShadow: themeConfig ? '0 4px 8px rgba(0,0,0,0.15)' : 'none',
                  }} 
                />
              </Link>
            ) : (
              <Avatar 
                alt={conversation.name} 
                src={getImageUrl(conversation.profilePic)} 
                sx={{ 
                  mr: 2,
                  border: themeConfig ? `2px solid ${themeConfig.avatarBorder}` : 'none',
                  boxShadow: themeConfig ? '0 4px 8px rgba(0,0,0,0.15)' : 'none',
                }} 
              />
            )}
            <Box>
              <Typography 
                variant="h6"
                sx={{
                  fontFamily: themeConfig ? '"Fredoka", "Nunito", sans-serif' : 'inherit',
                  fontWeight: themeConfig ? 700 : 'inherit',
                  color: themeConfig ? themeConfig.textColor : 'inherit',
                }}
              >
                {conversation.name}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  fontFamily: themeConfig ? '"Fredoka", "Nunito", sans-serif' : 'inherit',
                  color: themeConfig ? themeConfig.textColor : 'text.secondary',
                  opacity: themeConfig ? 0.75 : 1,
                }}
              >
                {conversationType}
              </Typography>
            </Box>

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>


              {/* Calendar Drawer Button */}
              <Tooltip title="View Calendar & Reminders">
                <IconButton
                  onClick={() => setCalendarOpen(true)}
                  sx={{
                    fontSize: '1.4rem',
                    transition: 'transform 0.3s ease',
                    color: themeConfig ? themeConfig.textColor : 'inherit',
                    '&:hover': {
                      transform: 'scale(1.15)',
                    },
                  }}
                >
                  📅
                </IconButton>
              </Tooltip>

              {/* Custom Wallpaper Upload / Settings Button */}
              <Tooltip title="Chat Wallpaper Options">
                <IconButton
                  onClick={(e) => setWallpaperMenuAnchor(e.currentTarget)}
                  sx={{
                    fontSize: '1.4rem',
                    transition: 'transform 0.3s ease',
                    color: themeConfig ? themeConfig.textColor : 'inherit',
                    '&:hover': {
                      transform: 'scale(1.15)',
                    },
                  }}
                >
                  🖼️
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={wallpaperMenuAnchor}
                open={Boolean(wallpaperMenuAnchor)}
                onClose={() => setWallpaperMenuAnchor(null)}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: 3,
                      mt: 1,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                    }
                  }
                }}
              >
                <MenuItem onClick={() => {
                  setWallpaperMenuAnchor(null);
                  wallpaperInputRef.current?.click();
                }}>
                  Upload Custom Wallpaper
                </MenuItem>
                {customWallpaperUrl && (
                  <MenuItem onClick={() => {
                    setWallpaperMenuAnchor(null);
                    handleRemoveWallpaper();
                  }} sx={{ color: 'error.main' }}>
                    Remove Custom Wallpaper
                  </MenuItem>
                )}
              </Menu>

              {/* Anime Theme Switcher Button */}
              <Tooltip title={`Switch Chat Theme (Current: ${themeConfig ? themeConfig.name : 'Default'})`}>
                <IconButton
                  onClick={cycleAnimeTheme}
                  sx={{
                    fontSize: '1.4rem',
                    transition: 'transform 0.3s ease',
                    background: themeConfig ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    border: themeConfig ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
                    color: themeConfig ? themeConfig.textColor : 'inherit',
                    '&:hover': {
                      transform: 'rotate(15deg) scale(1.15)',
                    },
                  }}
                >
                  {themeConfig ? themeConfig.icon : '🎨'}
                </IconButton>
              </Tooltip>

              {/* Bubble Settings Menu Trigger */}
              {conversation.type !== 'DM' && !conversation.isDefault &&
                (conversation.admins || []).some(admin => {
                  const id = admin?._id || admin;
                  return String(id) === String(currentUser?._id);
                }) && (
                  <Box>
                    <IconButton 
                      onClick={(e) => setHeaderMenuAnchor(e.currentTarget)} 
                      color="inherit"
                      sx={{ color: themeConfig ? themeConfig.textColor : 'inherit' }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={headerMenuAnchor}
                      open={Boolean(headerMenuAnchor)}
                      onClose={() => setHeaderMenuAnchor(null)}
                      slotProps={{
                        paper: {
                          sx: {
                            borderRadius: 3,
                            background: theme.palette.mode === 'dark' ? 'rgba(21, 31, 54, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                            border: '1px solid',
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                          }
                        }
                      }}
                    >
                      <MenuItem 
                        onClick={() => {
                          setHeaderMenuAnchor(null);
                          setDeleteCommunityConfirmOpen(true);
                        }} 
                        sx={{ color: 'error.main', gap: 1 }}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                        Delete Bubble
                      </MenuItem>
                    </Menu>
                  </Box>
                )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Offline Alert Banner */}
      {!isOnline && (
        <Box
          sx={{
            background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
            color: '#FFFFFF',
            textAlign: 'center',
            py: 1,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
            animation: 'slideDown 0.3s ease-out',
            '@keyframes slideDown': {
              '0%': { transform: 'translateY(-100%)', opacity: 0 },
              '100%': { transform: 'translateY(0)', opacity: 1 },
            }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            ⚠️ Connection lost. You are chatting in offline mode. Messages will auto-sync when online.
          </Typography>
        </Box>
      )}

      {/* Message Display Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          position: 'relative',
          bgcolor: themeConfig ? 'transparent' : 'background.default',
          backgroundImage: customWallpaperUrl
            ? `url(${customWallpaperUrl})`
            : (themeConfig ? `url(${themeConfig.wallpaper})` : 'none'),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: themeConfig 
              ? themeConfig.avatarBorder 
              : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
            borderRadius: '4px',
          },
        }}
      >
        {/* Floating anime-style particles */}
        {themeConfig && (
          <Box
            className="anime-particles-container"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 0,
              overflow: 'hidden',
            }}
          >
            {renderParticles(themeConfig.particleType)}
          </Box>
        )}

        {messages.map((msg) => {
          const isSender = String(msg.sender) === String(currentUser._id);
          return (
            <Box
              key={msg.id}
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isSender ? 'flex-end' : 'flex-start',
                mb: 2,
                '&:hover .message-actions': { opacity: 1 },
              }}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, zIndex: 1 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mx: 1,
                    fontFamily: themeConfig ? '"Fredoka", "Nunito", sans-serif' : 'inherit',
                    fontWeight: themeConfig ? 700 : 'normal',
                    color: themeConfig ? themeConfig.textColor : 'text.primary',
                  }}
                >
                  {getSenderInfo(msg.sender)?.username}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{
                    fontFamily: themeConfig ? '"Fredoka", "Nunito", sans-serif' : 'inherit',
                    color: themeConfig ? themeConfig.textColor : 'text.secondary',
                    opacity: themeConfig ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {formatTimestamp(msg.timestamp)}
                  {msg.isPending === 1 && (
                    <Tooltip title="Offline (Pending Sync)">
                      <Box component="span" sx={{ fontSize: '0.75rem', cursor: 'default' }}>
                        🕒
                      </Box>
                    </Tooltip>
                  )}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                {isSender && (
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
                      sx={{ color: themeConfig ? themeConfig.textColor : 'inherit' }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {!isSender && (
                  <RouterLink to={`/user/${msg.sender}`}>
                    <Avatar
                      alt={getSenderInfo(msg.sender)?.username}
                      src={getImageUrl(getSenderInfo(msg.sender)?.profilePic)}
                      sx={{ 
                        mr: 1.5, 
                        cursor: 'pointer',
                        border: themeConfig ? `2px solid ${themeConfig.avatarBorder}` : 'none',
                        boxShadow: themeConfig ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(-5deg)',
                        }
                      }}
                    />
                  </RouterLink>
                )}

                {/* Outer pop-in animation container */}
                <Box
                  sx={{
                    display: 'inline-block',
                    maxWidth: '70%',
                    animation: themeConfig ? 'bubblePopIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' : 'none',
                  }}
                >
                  {/* Inner floating bobbing & hover scaling container */}
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '100%',
                      animation: themeConfig
                        ? `animeBubbleBob${((msg.id || 0) % 3) + 1} ${3.5 + ((msg.id || 0) % 3) * 0.5}s ease-in-out infinite alternate`
                        : 'none',
                      animationDelay: themeConfig ? `-${((msg.id || 0) % 7) * 0.6}s` : 'none',
                      transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': {
                        transform: 'scale(1.04) translateY(-6px) rotate(0.5deg)',
                        zIndex: 10,
                      },
                      '&:hover .speech-tail': {
                        transform: 'scale(1.04) translateY(-6px)',
                      }
                    }}
                  >
                    {/* Speech bubble tail for Anime Theme */}
                    {themeConfig && (
                      <Box
                        className="speech-tail"
                        sx={{
                          position: 'absolute',
                          bottom: '14px',
                          width: 0,
                          height: 0,
                          borderStyle: 'solid',
                          zIndex: 3,
                          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          ...(isSender
                            ? {
                                right: '-8px',
                                borderWidth: '8px 0 8px 10px',
                                borderColor: `transparent transparent transparent ${themeConfig.tailColorSender}`,
                                filter: animeTheme === 'cyberpunk' 
                                  ? `drop-shadow(0 0 3px ${themeConfig.bubbleSender.border.split(' ').pop()})` 
                                  : `drop-shadow(3px 3px 0px ${themeConfig.bubbleSender.border.split(' ').pop()})`,
                              }
                            : {
                                left: '-8px',
                                borderWidth: '8px 10px 8px 0',
                                borderColor: `transparent ${themeConfig.tailColorReceiver} transparent transparent`,
                                filter: animeTheme === 'cyberpunk' 
                                  ? `drop-shadow(0 0 3px ${themeConfig.bubbleReceiver.border.split(' ').pop()})` 
                                  : `drop-shadow(-3px 3px 0px ${themeConfig.bubbleReceiver.border.split(' ').pop()})`,
                              }
                          )
                        }}
                      />
                    )}

                    <Paper
                      variant="outlined"
                      sx={
                        themeConfig
                          ? {
                              p: 1.75,
                              borderRadius: isSender 
                                ? '18px 18px 4px 18px' 
                                : '18px 18px 18px 4px',
                              wordBreak: 'break-word',
                              overflow: 'hidden',
                              fontFamily: '"Fredoka", "Nunito", sans-serif',
                              ...(isSender 
                                ? themeConfig.bubbleSender 
                                : themeConfig.bubbleReceiver
                              ),
                            }
                          : {
                              p: 1.5,
                              bgcolor: isSender ? 'primary.main' : 'background.paper',
                              color: isSender ? 'primary.contrastText' : 'text.primary',
                              borderRadius: isSender ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                              maxWidth: '100%',
                              wordBreak: 'break-word',
                              overflow: 'hidden',
                            }
                      }
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
                            border: themeConfig ? `2px solid ${themeConfig.avatarBorder}` : 'none',
                            transition: 'opacity 0.2s',
                            '&:hover': { opacity: 0.85 },
                          }}
                        />
                      )}
                      {msg.text && (
                        <Typography 
                          variant="body1"
                          sx={{
                            fontFamily: themeConfig ? '"Fredoka", "Nunito", sans-serif' : 'inherit',
                            fontWeight: themeConfig ? 500 : 'inherit',
                          }}
                        >
                          {msg.text}
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                </Box>

                {isSender && (
                  <RouterLink to={`/user/${currentUser._id}`}>
                    <Avatar
                      alt={currentUser.username}
                      src={getImageUrl(currentUser.profilePic)}
                      sx={{ 
                        ml: 1.5, 
                        cursor: 'pointer',
                        border: themeConfig ? `2px solid ${themeConfig.avatarBorder}` : 'none',
                        boxShadow: themeConfig ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)',
                        }
                      }}
                    />
                  </RouterLink>
                )}
              </Box>
            </Box>
          );
        })}



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
          p: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          borderTop: themeConfig ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: 0,
          background: themeConfig ? themeConfig.inputBg : 'background.paper',
          backdropFilter: themeConfig ? 'blur(16px)' : 'none',
          transition: 'all 0.3s ease',
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
        {/* Hidden custom wallpaper input */}
        <input
          type="file"
          accept="image/*"
          ref={wallpaperInputRef}
          onChange={handleWallpaperUpload}
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
          InputProps={{ 
            disableUnderline: true,
            sx: {
              fontFamily: themeConfig ? '"Fredoka", "Nunito", sans-serif' : 'inherit',
              color: themeConfig ? themeConfig.textColor : 'text.primary',
            }
          }}
        />
        <IconButton 
          type="submit" 
          sx={{ 
            p: '10px',
            color: themeConfig ? themeConfig.textColor : 'primary.main',
            opacity: themeConfig ? 0.85 : 1,
            transition: 'all 0.2s',
            '&:hover': { transform: 'scale(1.15)' }
          }}
        >
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

      {/* Delete Community Confirmation Dialog */}
      <Dialog
        open={deleteCommunityConfirmOpen}
        onClose={() => setDeleteCommunityConfirmOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              background: theme.palette.mode === 'dark' ? 'rgba(17, 27, 43, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Bubble</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
            Are you sure you want to delete <strong>{conversation.name}</strong>? This action is permanent and cannot be undone. All messages and files shared in this bubble will be removed for all members.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteCommunityConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCommunity} variant="contained" color="error" sx={{ borderRadius: 2 }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calendar & Reminders Drawer */}
      <CalendarDrawer
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        conversationId={conversation?._id}
        themeConfig={themeConfig}
      />
    </Box>
  );
}

export default ChatScreen;
