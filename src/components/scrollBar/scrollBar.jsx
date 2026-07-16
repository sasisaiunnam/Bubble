import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Badge,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  useTheme,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import { db } from '../../db';
import { socket } from '../../socket';

import {
  selectCurrentUser,
  selectUserCommunities,
  fetchUserCommunities,
  getUserProfile,
} from '../../store/slices/authSlice';
import { getImageUrl } from '../../utils/imageUrl';
import {
  getFriendSuggestions,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../../services/userService';
import {
  sendFriendRequest,
  getDiscoverableCommunities,
  joinCommunity,
  createCommunity,
  getMyInvites,
  acceptInvite,
  declineInvite,
  requestToJoinCommunity,
} from '../../services/communitySevice';
import CreateBubbleDialog from '../chat/CreateBubbleDialog';

function ScrollBar({ onConversationSelect }) {
  const [activeTab, setActiveTab] = useState('bubbles');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Suggestions State
  const [suggestions, setSuggestions] = useState({ loading: false, data: [], error: null });
  const [sendingRequest, setSendingRequest] = useState({});

  // Friend Requests State
  const [pendingRequests, setPendingRequests] = useState({ loading: false, data: [], error: null });
  const [updatingRequest, setUpdatingRequest] = useState({});

  // Discoverable Communities State
  const [discoverable, setDiscoverable] = useState({ loading: false, data: [], error: null });
  const [joiningCommunityState, setJoiningCommunityState] = useState({});

  // Create Bubble Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Pending Invites State
  const [pendingInvites, setPendingInvites] = useState({ loading: false, data: [], error: null });
  const [updatingInvite, setUpdatingInvite] = useState({});

  // Join Request State
  const [requestingJoin, setRequestingJoin] = useState({});

  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const communities = useSelector(selectUserCommunities);
  const token = useSelector((state) => state.auth.token);

  const [unreadConversationIds, setUnreadConversationIds] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Listen for real-time online status changes from backend via WebSocket
  useEffect(() => {
    // Request initial online users list
    socket.emit('getOnlineUsers');

    const handleOnlineUsersList = (usersList) => {
      setOnlineUsers(new Set(usersList));
    };

    const handleUserStatusChanged = ({ userId, isOnline }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (isOnline) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    };

    socket.on('onlineUsersList', handleOnlineUsersList);
    socket.on('userStatusChanged', handleUserStatusChanged);

    // Re-request online status list upon socket reconnection
    const handleReconnect = () => {
      socket.emit('getOnlineUsers');
    };
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('onlineUsersList', handleOnlineUsersList);
      socket.off('userStatusChanged', handleUserStatusChanged);
      socket.off('connect', handleReconnect);
    };
  }, []);

  // Periodically check for unread messages in local Dexie database
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const allConversations = await db.conversations.toArray();
        const ids = new Set(
          allConversations
            .filter((c) => c.unread === true)
            .map((c) => c.conversationId)
        );
        setUnreadConversationIds(ids);
      } catch (err) {
        console.error('Failed to query unread conversations in memory:', err);
      }
    };

    checkUnread();
    const timer = setInterval(checkUnread, 1500);
    return () => clearInterval(timer);
  }, []);

  const hasUnreadDMs = Array.from(unreadConversationIds).some(id => id.startsWith('dm_'));
  const hasUnreadBubbles = Array.from(unreadConversationIds).some(id => !id.startsWith('dm_'));

  // Dynamic style tokens based on active theme mode (light/dark)
  const isDark = theme.palette.mode === 'dark';
  const borderCol = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';
  const tagBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
  const searchBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
  const searchHoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
  const searchBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  const searchHoverBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
  const tabIndicatorGrad = isDark 
    ? 'linear-gradient(90deg, #98D9FF 0%, #C88BFF 100%)' 
    : 'linear-gradient(90deg, #387BFF 0%, #A855F7 100%)';
  const scrollbarThumbBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const scrollbarThumbHover = isDark 
    ? 'linear-gradient(180deg, #98D9FF 0%, #C88BFF 100%)' 
    : 'linear-gradient(180deg, #387BFF 0%, #A855F7 100%)';
  const indicatorShadow = isDark ? '0 0 10px rgba(152, 217, 255, 0.5)' : '0 0 10px rgba(56, 123, 255, 0.2)';
  const searchFocusShadow = isDark ? '0 0 8px rgba(152, 217, 255, 0.15)' : '0 0 8px rgba(56, 123, 255, 0.1)';

  // 1. Fetch suggestions
  const fetchSuggestionsData = useCallback(async () => {
    if (!token) return;
    setSuggestions((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getFriendSuggestions(token);
      setSuggestions({ loading: false, data: Array.isArray(data) ? data : [], error: null });
    } catch (err) {
      setSuggestions({
        loading: false,
        data: [],
        error: err.response?.data?.message || err.message || 'Failed to load suggestions',
      });
    }
  }, [token]);

  // 2. Fetch pending requests
  const fetchRequestsData = useCallback(async () => {
    if (!token) return;
    setPendingRequests((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getFriendRequests(token);
      setPendingRequests({ loading: false, data: Array.isArray(data) ? data : [], error: null });
    } catch (err) {
      setPendingRequests({
        loading: false,
        data: [],
        error: err.response?.data?.message || err.message || 'Failed to load requests',
      });
    }
  }, [token]);

  // 3. Fetch discoverable communities
  const fetchDiscoverableData = useCallback(async () => {
    if (!token) return;
    setDiscoverable((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getDiscoverableCommunities(token);
      setDiscoverable({ loading: false, data: Array.isArray(data) ? data : [], error: null });
    } catch (err) {
      setDiscoverable({
        loading: false,
        data: [],
        error: err.response?.data?.message || err.message || 'Failed to load discoverable',
      });
    }
  }, [token]);

  // 4. Fetch pending invites
  const fetchInvitesData = useCallback(async () => {
    if (!token) return;
    setPendingInvites((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getMyInvites(token);
      setPendingInvites({ loading: false, data: Array.isArray(data) ? data : [], error: null });
    } catch (err) {
      setPendingInvites({
        loading: false,
        data: [],
        error: err.response?.data?.message || err.message || 'Failed to load invites',
      });
    }
  }, [token]);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'suggestions') {
      fetchSuggestionsData();
    } else if (activeTab === 'friends') {
      fetchRequestsData();
      dispatch(getUserProfile());
    } else if (activeTab === 'bubbles') {
      dispatch(fetchUserCommunities());
      fetchDiscoverableData();
      fetchInvitesData();
    }
  }, [activeTab, fetchSuggestionsData, fetchRequestsData, fetchDiscoverableData, fetchInvitesData, dispatch]);

  // Handle Add Friend Action
  const handleAddFriend = async (userId) => {
    setSendingRequest((prev) => ({ ...prev, [userId]: true }));
    try {
      await sendFriendRequest(userId, token);
      setSuggestions((prev) => ({
        ...prev,
        data: prev.data.filter((u) => u._id !== userId),
      }));
    } catch (err) {
      console.error('Failed to send friend request:', err);
    } finally {
      setSendingRequest((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Handle Accept Request Action
  const handleAcceptRequest = async (requestId) => {
    setUpdatingRequest((prev) => ({ ...prev, [requestId]: true }));
    try {
      await acceptFriendRequest(requestId, token);
      setPendingRequests((prev) => ({
        ...prev,
        data: prev.data.filter((r) => r._id !== requestId),
      }));
      dispatch(getUserProfile());
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    } finally {
      setUpdatingRequest((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  // Handle Reject Request Action
  const handleRejectRequest = async (requestId) => {
    setUpdatingRequest((prev) => ({ ...prev, [requestId]: true }));
    try {
      await rejectFriendRequest(requestId, token);
      setPendingRequests((prev) => ({
        ...prev,
        data: prev.data.filter((r) => r._id !== requestId),
      }));
    } catch (err) {
      console.error('Failed to reject friend request:', err);
    } finally {
      setUpdatingRequest((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  // Handle Join Community
  const handleJoin = async (communityId) => {
    setJoiningCommunityState((prev) => ({ ...prev, [communityId]: true }));
    try {
      const joined = await joinCommunity(communityId, token);
      dispatch(fetchUserCommunities());
      setDiscoverable((prev) => ({
        ...prev,
        data: prev.data.map((c) =>
          c._id === joined._id ? { ...c, isMember: true } : c
        ),
      }));
    } catch (err) {
      console.error('Failed to join community:', err);
    } finally {
      setJoiningCommunityState((prev) => ({ ...prev, [communityId]: false }));
    }
  };

  // Handle Create Community
  const handleCreateCommunity = async (communityData) => {
    const created = await createCommunity(communityData, token);
    dispatch(fetchUserCommunities());
    fetchDiscoverableData();
    return created;
  };

  // Handle Request to Join (private community)
  const handleRequestJoin = async (communityId) => {
    setRequestingJoin((prev) => ({ ...prev, [communityId]: true }));
    try {
      await requestToJoinCommunity(communityId, token);
      setDiscoverable((prev) => ({
        ...prev,
        data: prev.data.map((c) =>
          c._id === communityId ? { ...c, hasRequestedJoin: true } : c
        ),
      }));
    } catch (err) {
      console.error('Failed to request join:', err);
    } finally {
      setRequestingJoin((prev) => ({ ...prev, [communityId]: false }));
    }
  };

  // Handle Accept Invite
  const handleAcceptInvite = async (communityId) => {
    setUpdatingInvite((prev) => ({ ...prev, [communityId]: true }));
    try {
      await acceptInvite(communityId, token);
      setPendingInvites((prev) => ({
        ...prev,
        data: prev.data.filter((c) => c._id !== communityId),
      }));
      dispatch(fetchUserCommunities());
      fetchDiscoverableData();
    } catch (err) {
      console.error('Failed to accept invite:', err);
    } finally {
      setUpdatingInvite((prev) => ({ ...prev, [communityId]: false }));
    }
  };

  // Handle Decline Invite
  const handleDeclineInvite = async (communityId) => {
    setUpdatingInvite((prev) => ({ ...prev, [communityId]: true }));
    try {
      await declineInvite(communityId, token);
      setPendingInvites((prev) => ({
        ...prev,
        data: prev.data.filter((c) => c._id !== communityId),
      }));
    } catch (err) {
      console.error('Failed to decline invite:', err);
    } finally {
      setUpdatingInvite((prev) => ({ ...prev, [communityId]: false }));
    }
  };

  // Handle start DM conversation with a friend
  const handleStartDM = async (friend) => {
    try {
      const dmConversationId = `dm_${[currentUser._id, friend._id].sort().join('_')}`;
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
      onConversationSelect(conversation);
    } catch (err) {
      console.error('Failed to start DM conversation:', err);
    }
  };

  // Filtering Logic
  const query = searchQuery.toLowerCase().trim();

  const filteredSuggestions = suggestions.data.filter((user) =>
    user.username.toLowerCase().includes(query)
  );

  const filteredFriends = (currentUser?.friends || []).filter((friend) =>
    friend.username.toLowerCase().includes(query)
  );

  const filteredPendingRequests = pendingRequests.data.filter((req) =>
    req.sender?.username?.toLowerCase().includes(query)
  );

  const localBubbles = communities.filter(
    (c) => c.isDefault && c.name.toLowerCase().includes(query)
  );
  const otherCommunities = communities.filter(
    (c) => !c.isDefault && c.name.toLowerCase().includes(query)
  );
  const filteredDiscoverable = discoverable.data.filter(
    (c) => c.name.toLowerCase().includes(query)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Tab Selectors with Icons */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => {
          setActiveTab(val);
          setSearchQuery('');
        }}
        variant="fullWidth"
        sx={{
          mb: 1.5,
          borderBottom: '1px solid',
          borderColor: borderCol,
          '& .MuiTab-root': {
            color: 'text.secondary',
            fontSize: '0.78rem',
            fontWeight: 600,
            py: 2,
            minWidth: 0,
            px: 0.5,
            gap: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              color: 'primary.main',
              opacity: 1,
            },
          },
          '& .Mui-selected': {
            color: 'primary.main',
            fontWeight: 'bold',
          },
          '& .MuiTabs-indicator': {
            height: 3,
            background: tabIndicatorGrad,
            borderRadius: '3px 3px 0 0',
            boxShadow: indicatorShadow,
          },
        }}
      >
        <Tab icon={<PersonAddIcon fontSize="small" />} iconPosition="start" label="Suggestions" value="suggestions" />
        <Tab 
          icon={<PeopleIcon fontSize="small" />} 
          iconPosition="start" 
          label="Friends" 
          value="friends" 
        />
        <Tab 
          icon={<GroupIcon fontSize="small" />} 
          iconPosition="start" 
          label="Bubbles" 
          value="bubbles" 
        />
      </Tabs>

      {/* Styled Search Input */}
      <Box sx={{ px: 2, mb: 1.5 }}>
        <TextField
          size="small"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 4,
                backgroundColor: searchBg,
                fontSize: '0.875rem',
                height: '38px',
                border: '1px solid',
                borderColor: searchBorder,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: searchHoverBorder,
                  backgroundColor: searchHoverBg,
                },
                '&.Mui-focused': {
                  borderColor: 'primary.main',
                  backgroundColor: searchHoverBg,
                  boxShadow: searchFocusShadow,
                },
              },
            },
          }}
        />
      </Box>

      {/* Scrollable Container with Custom Styled Scrollbar */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 1.5,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: scrollbarThumbBg,
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: scrollbarThumbHover,
          },
        }}
      >
        {/* ============================================= */}
        {/* SUGGESTIONS TAB                               */}
        {/* ============================================= */}
        {activeTab === 'suggestions' && (
          <>
            {suggestions.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {suggestions.error && (
              <Typography color="error" variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                {suggestions.error}
              </Typography>
            )}

            {!suggestions.loading && filteredSuggestions.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                  No suggestions available
                </Typography>
              </Box>
            )}

            <List sx={{ p: 0 }}>
              {filteredSuggestions.map((user) => (
                <ListItem
                  key={user._id}
                  secondaryAction={
                    <Tooltip title="Add Friend">
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => handleAddFriend(user._id)}
                        disabled={sendingRequest[user._id]}
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: 'rgba(56, 123, 255, 0.08)',
                            transform: 'scale(1.15)',
                          },
                        }}
                      >
                        {sendingRequest[user._id] ? (
                          <CircularProgress size={20} />
                        ) : (
                          <PersonAddIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{
                    borderRadius: 3,
                    mb: 0.75,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: hoverBg,
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={getImageUrl(user.profilePic)}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{user.username}</Typography>}
                    secondary={<Typography variant="caption" noWrap color="text.secondary" sx={{ display: 'block' }}>{user.bio || 'Hi! I am using Bubble'}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* ============================================= */}
        {/* FRIENDS TAB                                   */}
        {/* ============================================= */}
        {activeTab === 'friends' && (
          <>
            {pendingRequests.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {/* Pending Requests Section */}
            {!pendingRequests.loading && filteredPendingRequests.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    mx: 1,
                    my: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: isDark ? 'rgba(200, 139, 255, 0.08)' : 'rgba(168, 85, 247, 0.08)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(200, 139, 255, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                    color: 'secondary.main',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    display: 'inline-block',
                  }}
                >
                  Pending Requests ({filteredPendingRequests.length})
                </Typography>
                <List sx={{ p: 0, mt: 0.75 }}>
                  {filteredPendingRequests.map((req) => (
                    <ListItem
                      key={req._id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                          <Tooltip title="Accept">
                            <IconButton
                              edge="end"
                              color="success"
                              size="small"
                              onClick={() => handleAcceptRequest(req._id)}
                              disabled={updatingRequest[req._id]}
                              sx={{
                                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                transition: 'all 0.2s',
                                '&:hover': { 
                                  backgroundColor: 'rgba(46, 125, 50, 0.2)',
                                  transform: 'scale(1.15)',
                                },
                              }}
                            >
                              {updatingRequest[req._id] ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              edge="end"
                              color="error"
                              size="small"
                              onClick={() => handleRejectRequest(req._id)}
                              disabled={updatingRequest[req._id]}
                              sx={{
                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                transition: 'all 0.2s',
                                '&:hover': { 
                                  backgroundColor: 'rgba(211, 47, 47, 0.2)',
                                  transform: 'scale(1.15)',
                                },
                              }}
                            >
                              {updatingRequest[req._id] ? <CircularProgress size={16} /> : <ClearIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                      sx={{
                        borderRadius: 3,
                        mb: 0.75,
                        backgroundColor: isDark ? 'rgba(200, 139, 255, 0.03)' : 'rgba(168, 85, 247, 0.03)',
                        border: '1px dashed',
                        borderColor: isDark ? 'rgba(200, 139, 255, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={getImageUrl(req.sender?.profilePic)}>
                          {req.sender?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{req.sender?.username}</Typography>}
                        secondary={<Typography variant="caption" noWrap sx={{ display: 'block' }}>{req.sender?.bio || 'Wants to connect'}</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 1.5, borderColor: borderCol }} />
              </Box>
            )}

            {/* My Friends Section */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  mx: 1,
                  my: 1,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: tagBg,
                  color: 'text.secondary',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  display: 'inline-block',
                }}
              >
                My Friends ({filteredFriends.length})
              </Typography>

              {filteredFriends.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="body2">
                    No friends found
                  </Typography>
                </Box>
              )}

              <List sx={{ p: 0, mt: 0.75 }}>
                {filteredFriends.map((friend) => (
                  <ListItemButton
                    key={friend._id}
                    onClick={() => handleStartDM(friend)}
                    sx={{
                      borderRadius: 3,
                      mb: 0.75,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: hoverBg,
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                        <Badge
                          color="success"
                          variant="dot"
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          invisible={!onlineUsers.has(friend._id)}
                          sx={{
                            '& .MuiBadge-badge': {
                              backgroundColor: '#4caf50',
                              boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                            }
                          }}
                        >
                          <Avatar src={getImageUrl(friend.profilePic)}>
                            {friend.username.charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{friend.username}</Typography>}
                      secondary={<Typography variant="caption" noWrap color="text.secondary" sx={{ display: 'block' }}>{friend.bio || 'Online'}</Typography>}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          </>
        )}

        {/* ============================================= */}
        {/* COMMUNITIES (BUBBLES) TAB                    */}
        {/* ============================================= */}
        {activeTab === 'bubbles' && (
          <>
            {/* Create Bubble Button */}
            <Box sx={{ px: 1, mb: 1.5 }}>
              <ListItemButton
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: isDark ? 'rgba(152, 217, 255, 0.25)' : 'rgba(56, 123, 255, 0.25)',
                  backgroundColor: isDark ? 'rgba(152, 217, 255, 0.04)' : 'rgba(56, 123, 255, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 1.25,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: isDark ? 'rgba(152, 217, 255, 0.08)' : 'rgba(56, 123, 255, 0.06)',
                    transform: 'translateY(-1px)',
                    boxShadow: isDark ? '0 4px 16px rgba(152, 217, 255, 0.12)' : '0 4px 16px rgba(56, 123, 255, 0.1)',
                  },
                }}
              >
                <AddIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.82rem' }}>
                  Create New Bubble
                </Typography>
              </ListItemButton>
            </Box>

            {/* Pending Invites Section */}
            {pendingInvites.data.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    mx: 1,
                    my: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: isDark ? 'rgba(200, 139, 255, 0.08)' : 'rgba(168, 85, 247, 0.08)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(200, 139, 255, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                    color: 'secondary.main',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <LockIcon sx={{ fontSize: 14 }} />
                  Bubble Invites ({pendingInvites.data.length})
                </Typography>
                <List sx={{ p: 0, mt: 0.75 }}>
                  {pendingInvites.data.map((invite) => (
                    <ListItem
                      key={invite._id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                          <Tooltip title="Accept">
                            <IconButton
                              edge="end"
                              color="success"
                              size="small"
                              onClick={() => handleAcceptInvite(invite._id)}
                              disabled={updatingInvite[invite._id]}
                              sx={{
                                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  backgroundColor: 'rgba(46, 125, 50, 0.2)',
                                  transform: 'scale(1.15)',
                                },
                              }}
                            >
                              {updatingInvite[invite._id] ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Decline">
                            <IconButton
                              edge="end"
                              color="error"
                              size="small"
                              onClick={() => handleDeclineInvite(invite._id)}
                              disabled={updatingInvite[invite._id]}
                              sx={{
                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.2)',
                                  transform: 'scale(1.15)',
                                },
                              }}
                            >
                              {updatingInvite[invite._id] ? <CircularProgress size={16} /> : <ClearIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                      sx={{
                        borderRadius: 3,
                        mb: 0.75,
                        backgroundColor: isDark ? 'rgba(200, 139, 255, 0.03)' : 'rgba(168, 85, 247, 0.03)',
                        border: '1px dashed',
                        borderColor: isDark ? 'rgba(200, 139, 255, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={getImageUrl(invite.avatarUrl)}>
                          <LockIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{invite.name}</Typography>}
                        secondary={<Typography variant="caption" noWrap sx={{ display: 'block' }}>{invite.description || 'Private bubble invite'}</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 1.5, borderColor: borderCol }} />
              </Box>
            )}

            {/* Local Bubbles */}
            {localBubbles.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    mx: 1,
                    my: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: tagBg,
                    color: 'text.secondary',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    display: 'inline-block',
                  }}
                >
                  Local Bubbles
                </Typography>
                <List sx={{ p: 0, mt: 0.75 }}>
                  {localBubbles.map((bubble) => (
                    <ListItemButton
                      key={bubble._id}
                      onClick={() => onConversationSelect(bubble)}
                      sx={{ 
                        borderRadius: 3, 
                        mb: 0.75,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: hoverBg,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                          <Avatar src={getImageUrl(bubble.avatarUrl)}>
                            {bubble.isDefault ? 'B' : <PublicIcon />}
                          </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{bubble.name}</Typography>}
                        secondary={<Typography variant="caption" noWrap color="text.secondary" sx={{ display: 'block' }}>{bubble.description || 'Local bubble'}</Typography>}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            )}

            {/* My Bubbles */}
            {otherCommunities.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    mx: 1,
                    my: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: tagBg,
                    color: 'text.secondary',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    display: 'inline-block',
                  }}
                >
                  My Bubbles
                </Typography>
                <List sx={{ p: 0, mt: 0.75 }}>
                  {otherCommunities.map((bubble) => (
                    <ListItemButton
                      key={bubble._id}
                      onClick={() => onConversationSelect(bubble)}
                      sx={{ 
                        borderRadius: 3, 
                        mb: 0.75,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: hoverBg,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                          <Avatar src={getImageUrl(bubble.avatarUrl)}>
                            {bubble.isPublic === false ? <LockIcon fontSize="small" /> : <GroupIcon />}
                          </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{bubble.name}</Typography>
                            {bubble.isPublic === false && (
                              <LockIcon sx={{ fontSize: 12, color: isDark ? '#C88BFF' : '#A855F7', opacity: 0.7 }} />
                            )}
                          </Box>
                        }
                        secondary={<Typography variant="caption" noWrap color="text.secondary" sx={{ display: 'block' }}>{bubble.description || 'Bubble'}</Typography>}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            )}

            {/* Discover Bubbles */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  mx: 1,
                  my: 1,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: tagBg,
                  color: 'text.secondary',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  display: 'inline-block',
                }}
              >
                Discover Bubbles
              </Typography>

              {discoverable.loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={28} />
                </Box>
              )}

              {discoverable.error && (
                <Typography color="error" variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                  {discoverable.error}
                </Typography>
              )}

              {!discoverable.loading && filteredDiscoverable.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="body2">
                    No discoverable bubbles
                  </Typography>
                </Box>
              )}

              <List sx={{ p: 0, mt: 0.75 }}>
                {filteredDiscoverable.map((community) => {
                  // Determine the action button for each community
                  const renderAction = () => {
                    if (community.isMember) return null;

                    // Has a pending invite from admin
                    if (community.hasInvite) {
                      return (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Accept Invite">
                            <IconButton
                              edge="end"
                              color="success"
                              size="small"
                              onClick={() => handleAcceptInvite(community._id)}
                              disabled={updatingInvite[community._id]}
                              sx={{
                                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                transition: 'all 0.2s',
                                '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.2)', transform: 'scale(1.15)' },
                              }}
                            >
                              {updatingInvite[community._id] ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Decline">
                            <IconButton
                              edge="end"
                              color="error"
                              size="small"
                              onClick={() => handleDeclineInvite(community._id)}
                              disabled={updatingInvite[community._id]}
                              sx={{
                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                transition: 'all 0.2s',
                                '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.2)', transform: 'scale(1.15)' },
                              }}
                            >
                              {updatingInvite[community._id] ? <CircularProgress size={16} /> : <ClearIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      );
                    }

                    // Already requested to join
                    if (community.hasRequestedJoin) {
                      return (
                        <Tooltip title="Join Requested">
                          <Chip
                            icon={<HourglassEmptyIcon sx={{ fontSize: 14 }} />}
                            label="Pending"
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              backgroundColor: isDark ? 'rgba(255, 183, 77, 0.1)' : 'rgba(255, 152, 0, 0.08)',
                              color: isDark ? '#FFB74D' : '#F57C00',
                              border: '1px solid',
                              borderColor: isDark ? 'rgba(255, 183, 77, 0.25)' : 'rgba(255, 152, 0, 0.2)',
                            }}
                          />
                        </Tooltip>
                      );
                    }

                    // Public community — direct join
                    if (community.isPublic) {
                      return (
                        <Tooltip title="Join Bubble">
                          <IconButton
                            edge="end"
                            color="primary"
                            onClick={() => handleJoin(community._id)}
                            disabled={joiningCommunityState[community._id]}
                            sx={{
                              transition: 'all 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(56, 123, 255, 0.08)',
                                transform: 'scale(1.15)',
                              },
                            }}
                          >
                            {joiningCommunityState[community._id] ? (
                              <CircularProgress size={20} />
                            ) : (
                              <AddIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      );
                    }

                    // Private community — request to join
                    return (
                      <Tooltip title="Request to Join">
                        <IconButton
                          edge="end"
                          color="secondary"
                          onClick={() => handleRequestJoin(community._id)}
                          disabled={requestingJoin[community._id]}
                          sx={{
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: isDark ? 'rgba(200, 139, 255, 0.08)' : 'rgba(168, 85, 247, 0.08)',
                              transform: 'scale(1.15)',
                            },
                          }}
                        >
                          {requestingJoin[community._id] ? (
                            <CircularProgress size={20} />
                          ) : (
                            <PersonAddIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    );
                  };

                  return (
                    <ListItem
                      key={community._id}
                      secondaryAction={renderAction()}
                      sx={{
                        borderRadius: 3,
                        mb: 0.75,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: hoverBg,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <ListItemButton
                        onClick={() => community.isMember && onConversationSelect(community)}
                        disabled={!community.isMember}
                        sx={{ p: 0, borderRadius: 3 }}
                      >
                        <ListItemAvatar sx={{ pl: 2, py: 1 }}>
                          <Avatar src={getImageUrl(community.avatarUrl)}>
                            {community.isPublic === false ? <LockIcon fontSize="small" /> : <GroupIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{community.name}</Typography>
                              {community.isPublic === false && (
                                <LockIcon sx={{ fontSize: 11, color: isDark ? '#C88BFF' : '#A855F7', opacity: 0.6 }} />
                              )}
                            </Box>
                          }
                          secondary={<Typography variant="caption" noWrap color="text.secondary" sx={{ display: 'block' }}>{community.description || 'Bubble'}</Typography>}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>

            {communities.length === 0 && !discoverable.loading && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                  You haven't joined any bubbles yet.
                </Typography>
              </Box>
            )}

            {/* Create Bubble Dialog */}
            <CreateBubbleDialog
              open={createDialogOpen}
              onClose={() => setCreateDialogOpen(false)}
              onCreated={handleCreateCommunity}
            />
          </>
        )}
      </Box>
    </Box>
  );
}

export default ScrollBar;
