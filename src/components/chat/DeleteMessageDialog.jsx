import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * DeleteMessageDialog displays a premium-styled confirmation dialog
 * when a user attempts to delete a message.
 * 
 * Props:
 * - open: boolean to control visibility
 * - onClose: callback function when dialog is cancelled/closed
 * - onConfirm: callback function when deletion is confirmed
 */
export default function DeleteMessageDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-message-dialog-title"
      aria-describedby="delete-message-dialog-description"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            padding: 2,
            maxWidth: 400,
          },
        },
      }}
    >
      <DialogTitle id="delete-message-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'rgba(211, 47, 47, 0.12)',
            color: 'error.main',
          }}
        >
          <DeleteIcon />
        </Box>
        <Typography variant="h6" component="span" fontWeight="bold">
          Delete Message?
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <DialogContentText id="delete-message-dialog-description" color="text.secondary">
          Are you sure you want to permanently delete this message? This action will remove the message for everyone and cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 8 }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" autoFocus sx={{ borderRadius: 8 }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
