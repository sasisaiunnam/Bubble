import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import db from '../../db';

function CalendarDrawer({ open, onClose, conversationId, themeConfig }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDateTime, setNewDateTime] = useState('');

  // Fetch reminders for this conversation
  const loadReminders = async () => {
    if (!conversationId) return;
    try {
      const stored = await db.reminders
        .where('conversationId')
        .equals(conversationId)
        .toArray();
      setReminders(stored);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    }
  };

  useEffect(() => {
    if (open) {
      loadReminders();
    }
  }, [open, conversationId]);

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get total days in month and first day weekday offset (0 = Sunday, 1 = Monday...)
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1
  // Convert Sunday=0 index to Monday=0 index for European style grid
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Create grid cells
  const cells = [];
  // Empty padding cells for start offset
  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }
  // Days of the month
  for (let d = 1; d <= totalDays; d++) {
    cells.push(new Date(year, month, d));
  }

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDateTime || !conversationId) return;

    try {
      const reminderDate = new Date(newDateTime);
      await db.reminders.add({
        conversationId,
        title: newTitle,
        timestamp: reminderDate.getTime(),
        isCompleted: 0,
      });
      setNewTitle('');
      setNewDateTime('');
      loadReminders();
    } catch (err) {
      console.error('Failed to add reminder:', err);
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await db.reminders.delete(id);
      loadReminders();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  // Filter reminders for the selected date
  const selectedDateReminders = reminders.filter((r) => {
    const rDate = new Date(r.timestamp);
    return (
      rDate.getDate() === selectedDate.getDate() &&
      rDate.getMonth() === selectedDate.getMonth() &&
      rDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Check if a specific cell has any active reminders
  const dayHasReminders = (date) => {
    if (!date) return false;
    return reminders.some((r) => {
      const rDate = new Date(r.timestamp);
      return (
        rDate.getDate() === date.getDate() &&
        rDate.getMonth() === date.getMonth() &&
        rDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 360 },
            background: themeConfig ? themeConfig.inputBg : 'background.paper',
            backdropFilter: themeConfig ? 'blur(20px)' : 'none',
            borderLeft: themeConfig ? `1.5px solid ${themeConfig.avatarBorder}` : '1px solid rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: themeConfig ? '"Fredoka", "Nunito", sans-serif' : 'inherit',
          }
        }
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: themeConfig ? `1.5px solid ${themeConfig.avatarBorder}` : '1px solid rgba(0,0,0,0.08)',
          background: themeConfig ? themeConfig.headerBg : 'transparent',
          color: themeConfig ? themeConfig.textColor : 'text.primary',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon /> Chat Reminders
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Calendar Month Selector */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 2 }}>
          <IconButton size="small" onClick={handlePrevMonth} sx={{ color: themeConfig ? themeConfig.textColor : 'primary.main' }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontFamily: 'inherit', color: themeConfig ? themeConfig.textColor : 'text.primary' }}>
            {monthNames[month]} {year}
          </Typography>
          <IconButton size="small" onClick={handleNextMonth} sx={{ color: themeConfig ? themeConfig.textColor : 'primary.main' }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Weekdays Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', width: '100%', textAlign: 'center', mb: 1 }}>
          {weekdayNames.map((day) => (
            <Typography
              key={day}
              variant="caption"
              sx={{
                fontWeight: 700,
                color: themeConfig ? themeConfig.textColor : 'text.secondary',
                opacity: 0.6,
                fontFamily: 'inherit',
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        {/* Days Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, width: '100%' }}>
          {cells.map((cell, idx) => {
            if (!cell) {
              return <Box key={`empty-${idx}`} />;
            }
            const isSelected =
              cell.getDate() === selectedDate.getDate() &&
              cell.getMonth() === selectedDate.getMonth() &&
              cell.getFullYear() === selectedDate.getFullYear();
            const hasRem = dayHasReminders(cell);

            return (
              <Box
                key={cell.getTime()}
                onClick={() => setSelectedDate(cell)}
                sx={{
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  bgcolor: isSelected
                    ? (themeConfig ? themeConfig.avatarBorder : 'primary.main')
                    : 'transparent',
                  color: isSelected
                    ? '#FFFFFF'
                    : (themeConfig ? themeConfig.textColor : 'text.primary'),
                  border: isSelected
                    ? 'none'
                    : (themeConfig ? '1px solid transparent' : 'none'),
                  '&:hover': {
                    bgcolor: isSelected
                      ? (themeConfig ? themeConfig.avatarBorder : 'primary.main')
                      : (themeConfig ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.04)'),
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontFamily: 'inherit', fontWeight: 'inherit' }}>
                  {cell.getDate()}
                </Typography>
                {hasRem && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      bgcolor: isSelected ? '#FFFFFF' : (themeConfig ? themeConfig.textColor : 'primary.main'),
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Reminders List for Selected Day */}
      <Box sx={{ p: 2.5, flexGrow: 1, overflowY: 'auto', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontFamily: 'inherit', color: themeConfig ? themeConfig.textColor : 'text.primary' }}>
          Reminders for {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </Typography>

        {selectedDateReminders.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontFamily: 'inherit' }}>
            No reminders scheduled.
          </Typography>
        ) : (
          <List dense disablePadding>
            {selectedDateReminders.map((rem) => (
              <ListItem
                key={rem.id}
                sx={{
                  px: 0,
                  py: 1,
                  borderBottom: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <ListItemText
                  primary={rem.title}
                  primaryTypographyProps={{
                    sx: {
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      color: themeConfig ? themeConfig.textColor : 'text.primary',
                    }
                  }}
                  secondary={new Date(rem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  secondaryTypographyProps={{
                    sx: {
                      fontFamily: 'inherit',
                      color: themeConfig ? themeConfig.textColor : 'text.secondary',
                      opacity: 0.7,
                    }
                  }}
                />
                <ListItemSecondaryAction sx={{ right: 0 }}>
                  <IconButton onClick={() => handleDeleteReminder(rem.id)} size="small" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Add Reminder Form */}
      <Box
        component="form"
        onSubmit={handleAddReminder}
        sx={{
          p: 2.5,
          borderTop: themeConfig ? `1.5px solid ${themeConfig.avatarBorder}` : '1px solid rgba(0,0,0,0.08)',
          background: themeConfig ? themeConfig.headerBg : 'transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'inherit', color: themeConfig ? themeConfig.textColor : 'text.primary' }}>
          Add Reminder
        </Typography>
        <TextField
          size="small"
          label="Reminder Title"
          variant="outlined"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
          autoComplete="off"
          InputProps={{ sx: { fontFamily: 'inherit' } }}
          InputLabelProps={{ sx: { fontFamily: 'inherit' } }}
        />
        <TextField
          size="small"
          type="datetime-local"
          variant="outlined"
          value={newDateTime}
          onChange={(e) => setNewDateTime(e.target.value)}
          required
          InputProps={{ sx: { fontFamily: 'inherit' } }}
        />
        <Button
          type="submit"
          variant="contained"
          size="small"
          sx={{
            py: 1,
            fontWeight: 700,
            borderRadius: 2,
            fontFamily: 'inherit',
            bgcolor: themeConfig ? themeConfig.textColor : 'primary.main',
            color: '#FFFFFF',
            '&:hover': {
              bgcolor: themeConfig ? themeConfig.textColor : 'primary.dark',
              opacity: 0.9,
            }
          }}
        >
          Add Reminder
        </Button>
      </Box>
    </Drawer>
  );
}

export default CalendarDrawer;
