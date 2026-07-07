import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    CircularProgress,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import db from '../../db';
import { logoutUser, selectCurrentUser, fetchUserCommunities, selectUserCommunities } from '../../store/slices/authSlice';

const drawerWidth = 300;

function Sidebar({ onConversationSelect }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const communities = useSelector(selectUserCommunities);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        navigate('/profile');
        handleMenuClose();
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        handleMenuClose();
    };

    useEffect(() => {
        setLoading(true);
        dispatch(fetchUserCommunities())
            .unwrap()
            .catch((err) => setError(err.message || 'Failed to load communities'))
            .finally(() => setLoading(false));
    }, [dispatch]);

    const localBubbles = communities.filter(c => c.isDefault);
    const otherCommunities = communities.filter(c => !c.isDefault);

    if (loading) {
        return (
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                    },
                    '& .MuiDrawer-paper': {
                      alignItems: 'center',
                      justifyContent: 'center',
                      display: 'flex',
                    },
                }}
            >
                <CircularProgress />
            </Drawer>
        );
    }

    // Helper function to get avatar initials
    const getInitials = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h5" component="h1" gutterBottom>
                        Bubbles
                    </Typography>
                </Box>
                <Divider />

                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {error ? (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {localBubbles.length > 0 && (
                                <>
                                    <List subheader={<Typography sx={{ p: 2, fontWeight: 'bold' }} color="text.secondary">Local Bubbles</Typography>} sx={{ width: '100%', bgcolor: 'background.paper', py: 0 }}>
                                        {localBubbles.map((bubble) => (
                                            <ListItemButton key={bubble._id} onClick={() => onConversationSelect(bubble)}>
                                                <ListItemAvatar>
                                                    <Avatar src={bubble.avatarUrl}><PublicIcon /></Avatar>
                                                </ListItemAvatar>
                                                <ListItemText primary={bubble.name} secondary={bubble.description || 'Local community'} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                    <Divider />
                                </>
                            )}
                            {otherCommunities.length > 0 && (
                                <List subheader={<Typography sx={{ p: 2, fontWeight: 'bold' }} color="text.secondary">My Communities</Typography>} sx={{ width: '100%', bgcolor: 'background.paper', py: 0 }}>
                                    {otherCommunities.map((bubble) => (
                                        <ListItemButton key={bubble._id} onClick={() => onConversationSelect(bubble)}>
                                            <ListItemAvatar>
                                                <Avatar src={bubble.avatarUrl}><GroupIcon /></Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={bubble.name} secondary={bubble.description || 'Community'} />
                                        </ListItemButton>
                                    ))}
                                </List>
                            )}
                            {communities.length === 0 && !loading && (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        You haven't joined any communities yet.
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Box>

                <Divider />

                <ListItemButton
                    onClick={handleMenuClick}
                    sx={{
                        p: 2,
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                    }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <ListItemAvatar>
                        <Avatar src={currentUser?.profilePic}>{getInitials(currentUser?.username)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={<Typography noWrap>{currentUser?.username || 'User'}</Typography>} />
                </ListItemButton>

                <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }}
                >
                    <MenuItem onClick={handleProfile}>
                        <ListItemIcon>
                            <AccountCircleIcon fontSize="small" />
                        </ListItemIcon>
                        Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </Box>
        </Drawer>
    );
}

export default Sidebar;