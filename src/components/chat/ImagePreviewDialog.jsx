import React from 'react';
import { Dialog, DialogContent, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * ImagePreviewDialog displays a full-size image in a modal overlay.
 * Used both for previewing before send and for viewing sent images.
 *
 * Props:
 * - open: boolean to control visibility
 * - onClose: callback when dialog is closed
 * - imageSrc: the image URL (blob URL or data URL) to display
 */
export default function ImagePreviewDialog({ open, onClose, imageSrc }) {
  if (!imageSrc) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'transparent',
            boxShadow: 'none',
            maxHeight: '90vh',
            maxWidth: '90vw',
          },
        },
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:first-of-type': { pt: 0 },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            zIndex: 1,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          component="img"
          src={imageSrc}
          alt="Full size preview"
          sx={{
            maxWidth: '100%',
            maxHeight: '85vh',
            objectFit: 'contain',
            borderRadius: 2,
            display: 'block',
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
