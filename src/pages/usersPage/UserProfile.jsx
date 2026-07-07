import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import EditIcon from '@mui/icons-material/Edit';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import {
  selectCurrentUser,
  selectAuthStatus,
  logoutUser,
} from '../../store/slices/authSlice';
import { getImageUrl } from '../../utils/imageUrl';

function UserProfile() {
  const user = useSelector(selectCurrentUser);
  const status = useSelector(selectAuthStatus);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  // Better loading state handling
  if (status === 'loading') {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Typography>Please log in to view your profile.</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
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
            alt={user.username || user.name || 'User'}
            sx={{ width: 120, height: 120, mb: 2, border: '4px solid', borderColor: 'primary.main' }}
          />
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
        </Box>

        <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
          {user.username || user.name || 'User'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {user.email || ''}
        </Typography>
        {user.bio && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, fontStyle: 'italic' }}>
            "{user.bio}"
          </Typography>
        )}

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
          <Button
            variant="contained"
            color="primary"
            startIcon={<ExitToAppIcon />}
            onClick={handleLogout}
            sx={{ borderRadius: '50px', px: 3 }}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default UserProfile;
