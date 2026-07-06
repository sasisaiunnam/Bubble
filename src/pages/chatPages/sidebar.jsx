import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Box,
  Divider,
} from '@mui/material';

const drawerWidth = 300;

// MOCK DATA: In a real application, this would come from an API call
const conversations = [
  {
    id: '1',
    name: 'Sasi Sai',
    profilePic: '/static/images/avatar/1.jpg', // Placeholder image path
    lastMessage: 'Hey! Are we still on for tomorrow?',
  },
  {
    id: '2',
    name: 'Project Phoenix', // This is a "Bubble" (chat room)
    profilePic: '/static/images/avatar/5.jpg', // Placeholder for group
    lastMessage: 'Meeting has been rescheduled.',
  },
  {
    id: '3',
    name: 'Jane Doe',
    profilePic: '/static/images/avatar/2.jpg',
    lastMessage: 'Can you send me the report?',
  },
  {
    id: '4',
    name: 'Weekend Hangout', // This is another "Bubble"
    profilePic: '/static/images/avatar/6.jpg',
    lastMessage: 'Pizza sounds good!',
  },
];

function Sidebar({ onConversationSelect }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)', // Subtle border for dark mode
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Bubbles
        </Typography>
      </Box>
      <Divider />
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {conversations.map((convo, index) => (
          <React.Fragment key={convo.id}>
            <ListItem alignItems="flex-start" disablePadding>
              <ListItemButton onClick={() => onConversationSelect(convo)}>
                <ListItemAvatar>
                  <Avatar alt={convo.name} src={convo.profilePic} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography noWrap sx={{ fontWeight: 'medium' }}>
                      {convo.name}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                    >
                      {convo.lastMessage}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < conversations.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;