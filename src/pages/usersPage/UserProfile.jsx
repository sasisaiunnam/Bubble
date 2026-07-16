import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Avatar,
  Typography,
  Button,
  Paper,
  Container,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import EditIcon from '@mui/icons-material/Edit';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import PeopleIcon from '@mui/icons-material/People';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

import {
  selectCurrentUser,
  selectAuthStatus,
  logoutUser,
  getUserProfile as reloadCurrentUserProfile,
} from '../../store/slices/authSlice';
import { getImageUrl } from '../../utils/imageUrl';
import {
  getUserById,
  getFriendshipStatus,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriendUser,
} from '../../services/userService';
import { sendFriendRequest } from '../../services/communitySevice';

function UserProfile() {
  const currentUser = useSelector(selectCurrentUser);
  const authStatus = useSelector(selectAuthStatus);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();

  // Local state for visiting profile
  const [profile, setProfile] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);

  const isCurrentUser = !userId || userId === currentUser?._id;

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileData, statusData] = await Promise.all([
          getUserById(userId, token),
          getFriendshipStatus(userId, token),
        ]);
        setProfile(profileData);
        setFriendshipStatus(statusData.status);
        setRequestId(statusData.requestId || null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (!isCurrentUser && userId && token) {
      fetchProfileData();
    }
  }, [userId, token, isCurrentUser]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  const handleSendFriendRequest = async () => {
    setActionLoading(true);
    try {
      await sendFriendRequest(userId, token);
      setFriendshipStatus('request_sent');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await acceptFriendRequest(requestId, token);
      setFriendshipStatus('friends');
      dispatch(reloadCurrentUserProfile()); // refresh current user friends
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to accept friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await rejectFriendRequest(requestId, token);
      setFriendshipStatus('not_friends');
      setRequestId(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reject friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleUnfriend = async () => {
    setMenuAnchor(null);
    setActionLoading(true);
    try {
      await unfriendUser(userId, token);
      setFriendshipStatus('not_friends');
      setRequestId(null);
      dispatch(reloadCurrentUserProfile());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to unfriend user');
    } finally {
      setActionLoading(false);
    }
  };

  // Loading states
  if (loading || (isCurrentUser && authStatus === 'loading')) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  const user = isCurrentUser ? currentUser : profile;

  if (!user) {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="error">{error || 'User profile not found.'}</Alert>
        <Button variant="contained" onClick={() => navigate('/chat')} sx={{ mt: 2, borderRadius: '50px' }}>
          Back to Chat
        </Button>
      </Container>
    );
  }

  const renderFriendshipActions = () => {
    if (isCurrentUser) return null;

    if (actionLoading) {
      return <CircularProgress size={24} sx={{ my: 1 }} />;
    }

    switch (friendshipStatus) {
      case 'friends':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="success"
              onClick={handleMenuOpen}
              startIcon={<PeopleIcon />}
              sx={{ borderRadius: '50px', px: 3, fontWeight: 'bold' }}
            >
              Friends
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    borderRadius: 3,
                    minWidth: 140,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }
                }
              }}
            >
              <MenuItem onClick={handleUnfriend} sx={{ color: 'error.main', py: 1 }}>
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <PersonRemoveIcon fontSize="small" />
                </ListItemIcon>
                Unfriend
              </MenuItem>
            </Menu>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ChatIcon />}
              onClick={() => navigate('/chat', { state: { startDMWith: user } })}
              sx={{ borderRadius: '50px', px: 3, fontWeight: 'bold' }}
            >
              Message
            </Button>
          </Box>
        );
      case 'request_sent':
        return (
          <Button
            variant="outlined"
            color="warning"
            disabled
            startIcon={<HourglassEmptyIcon />}
            sx={{ borderRadius: '50px', px: 4, fontWeight: 'bold' }}
          >
            Request Sent
          </Button>
        );
      case 'request_received':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={handleAcceptRequest}
              sx={{ borderRadius: '50px', px: 3, fontWeight: 'bold' }}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearIcon />}
              onClick={handleRejectRequest}
              sx={{ borderRadius: '50px', px: 3, fontWeight: 'bold' }}
            >
              Reject
            </Button>
          </Box>
        );
      case 'not_friends':
      default:
        return (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleSendFriendRequest}
            sx={{ borderRadius: '50px', px: 4, fontWeight: 'bold' }}
          >
            Send Friend Request
          </Button>
        );
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 4 }}>{error}</Alert>}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: '16px',
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            src={user.profilePic ? getImageUrl(user.profilePic) : '/static/images/avatar/1.jpg'}
            alt={user.username || 'User'}
            sx={{ width: 120, height: 120, mb: 2, border: '4px solid', borderColor: 'primary.main' }}
          />
          {isCurrentUser && (
            <Tooltip title="Edit Profile">
              <IconButton
                onClick={handleEdit}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'grey.200' },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
          {user.username || 'User'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {isCurrentUser ? user.email : ''}
        </Typography>
        {user.bio ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, fontStyle: 'italic' }}>
            "{user.bio}"
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, fontStyle: 'italic' }}>
            "No bio available."
          </Typography>
        )}

        <Box sx={{ mb: 3 }}>
          {renderFriendshipActions()}
        </Box>

        <Divider sx={{ width: '100%', mb: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ChatIcon />}
            onClick={() => navigate('/chat')}
            sx={{ borderRadius: '50px', px: 3 }}
          >
            Back to Chat
          </Button>
          {isCurrentUser && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
              sx={{ borderRadius: '50px', px: 3 }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default UserProfile;
