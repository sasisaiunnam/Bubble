import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material'; // Added Alert
import ChatIcon from '@mui/icons-material/Chat';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import {
  selectCurrentUser,
  updateUserProfile,
  selectAuthStatus,
  selectAuthError, // Added
} from '../../store/slices/authSlice';
import { getImageUrl } from '../../utils/imageUrl';

function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector(selectCurrentUser);
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError); // Get error from Redux
  const isLoading = authStatus === 'loading';

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState('');
  const [localError, setLocalError] = useState('');
  const [removePicture, setRemovePicture] = useState(false); // Added

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setBio(currentUser.bio || '');
      const imageUrl = currentUser.profilePic ? getImageUrl(currentUser.profilePic) : '';
      setPreview(imageUrl);
      setRemovePicture(false);
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
      setRemovePicture(false); // Cancel removal if new file selected
      setLocalError(''); // Clear any errors
    }
  };

  const handleRemovePicture = () => {
    setRemovePicture(true);
    setProfilePic(null);
    setPreview(''); // Clear preview
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Create FormData
    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    
    // Handle profile picture
    if (removePicture) {
      // Send empty string to remove picture
      formData.append('profilePic', '');
    } else if (profilePic) {
      // Send the file
      formData.append('profilePic', profilePic);
    }
    // If neither, don't send profilePic field (keep existing)

    // Log what we're sending (for debugging)
    console.log('Sending FormData:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
    }

    try {
      const result = await dispatch(updateUserProfile(formData)).unwrap();
      console.log('Profile updated successfully:', result);
      navigate('/profile');
    } catch (err) {
      console.error('Update failed:', err);
      setLocalError(err || 'Failed to update profile.');
    }
  };

  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
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
        <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Edit Profile
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          {/* Profile Picture Section */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'relative' }}>
            <Avatar 
              src={preview || getImageUrl(currentUser.profilePic)} 
              sx={{ width: 120, height: 120 }}
            />
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="label"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 'calc(50% - 60px)',
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'grey.200',
                },
              }}
            >
              <input hidden accept="image/*" type="file" onChange={handleFileChange} />
              <PhotoCamera />
            </IconButton>
          </Box>

          {/* Picture Actions */}
          {currentUser.profilePic && !removePicture && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button 
                size="small" 
                color="error" 
                onClick={handleRemovePicture}
                sx={{ textTransform: 'none' }}
              >
                Remove Profile Picture
              </Button>
            </Box>
          )}
          
          {removePicture && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Profile picture will be removed when you save.
              <Button 
                size="small" 
                onClick={() => setRemovePicture(false)}
                sx={{ ml: 1 }}
              >
                Undo
              </Button>
            </Alert>
          )}

          {/* Username Field */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: '28px' 
              } 
            }}
          />

          {/* Bio Field */}
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={3}
            id="bio"
            label="Bio"
            name="bio"
            autoComplete="off"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: '20px' 
              } 
            }}
          />

          {/* Error Display */}
          {(localError || authError) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {localError || authError}
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ChatIcon />}
              onClick={() => navigate('/chat')}
              sx={{ borderRadius: '50px', px: 3 }}
            >
              Back to Chat
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ 
                borderRadius: '50px', 
                px: 3,
                minWidth: '120px'
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditProfile;