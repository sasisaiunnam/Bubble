import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import AddIcon from '@mui/icons-material/Add';

function CreateBubbleDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Bubble name is required');
      return;
    }
    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onCreated({
        name: name.trim(),
        description: description.trim(),
        isPublic,
        tags,
      });
      // Reset and close
      setName('');
      setDescription('');
      setIsPublic(true);
      setTags([]);
      setTagInput('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create bubble');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  // Theme-adaptive colors
  const accentGrad = isDark
    ? 'linear-gradient(135deg, #98D9FF 0%, #C88BFF 100%)'
    : 'linear-gradient(135deg, #387BFF 0%, #A855F7 100%)';
  const surfaceBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
  const borderCol = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            background: isDark
              ? 'rgba(17, 27, 43, 0.98)'
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(24px)',
            border: `1px solid ${borderCol}`,
            boxShadow: isDark
              ? '0 32px 64px rgba(0, 0, 0, 0.6)'
              : '0 32px 64px rgba(0, 0, 0, 0.15)',
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: accentGrad,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AddIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.3px' }}>
            Create Bubble
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={loading}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Name Field */}
        <TextField
          label="Bubble Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          autoFocus
          inputProps={{ maxLength: 50 }}
          sx={{ mb: 2.5 }}
          helperText={`${name.length}/50`}
        />

        {/* Description Field */}
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          inputProps={{ maxLength: 500 }}
          sx={{ mb: 2.5 }}
          helperText={`${description.length}/500`}
        />

        {/* Tags */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              label="Add Tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              size="small"
              fullWidth
              inputProps={{ maxLength: 30 }}
              helperText={`${tags.length}/5 tags`}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || tags.length >= 5}
              sx={{ minWidth: 48, height: 40, borderRadius: 2 }}
            >
              <AddIcon fontSize="small" />
            </Button>
          </Box>
          {tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{
                    borderRadius: 2,
                    background: isDark
                      ? 'rgba(152, 217, 255, 0.1)'
                      : 'rgba(56, 123, 255, 0.08)',
                    border: '1px solid',
                    borderColor: isDark
                      ? 'rgba(152, 217, 255, 0.2)'
                      : 'rgba(56, 123, 255, 0.15)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Public/Private Toggle */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            backgroundColor: surfaceBg,
            border: `1px solid ${borderCol}`,
            transition: 'all 0.3s ease',
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={!isPublic}
                onChange={(e) => setIsPublic(!e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: isDark ? '#C88BFF' : '#A855F7',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: isDark ? '#C88BFF' : '#A855F7',
                  },
                }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isPublic ? (
                  <PublicIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                ) : (
                  <LockIcon sx={{ fontSize: 20, color: isDark ? '#C88BFF' : '#A855F7' }} />
                )}
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {isPublic ? 'Public Bubble' : 'Private Bubble'}
                </Typography>
              </Box>
            }
          />
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              ml: 6,
              color: 'text.secondary',
              lineHeight: 1.5,
            }}
          >
            {isPublic
              ? 'Anyone can discover and join this bubble'
              : 'Only invited members can join. Others can send a join request for admin approval.'}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          sx={{
            borderRadius: 2,
            px: 3,
            background: accentGrad,
            fontWeight: 700,
            '&:hover': {
              background: accentGrad,
              filter: 'brightness(1.1)',
            },
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Bubble'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateBubbleDialog;
