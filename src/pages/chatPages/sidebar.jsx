import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Drawer,
    Box,
    Divider,
    Typography,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Menu,
    MenuItem,
    ListItemIcon,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import {
    logoutUser,
    selectCurrentUser,
    fetchUserCommunities,
} from '../../store/slices/authSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { autoJoinBubble } from '../../services/communitySevice';
import ScrollBar from '../../components/scrollBar/scrollBar';
import ThemeToggle from '../../components/UI/ThemeToggle';

const drawerWidth = 300;

function Sidebar({ onConversationSelect }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const theme = useTheme();

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const token = useSelector((state) => state.auth.token);

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

    const getCurrentLocation = useCallback(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const bubble = await autoJoinBubble(latitude, longitude, token);
                    if (bubble) {
                        dispatch(fetchUserCommunities());
                    }
                } catch (error) {
                    console.error('Failed to auto-join bubble:', error);
                }
            }, (error) => {
                console.error("Geolocation error:", error);
            });
        }
    }, [dispatch, token]);

    useEffect(() => {
        if (token) getCurrentLocation();
    }, [token, getCurrentLocation]);

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
                    borderRight: theme.palette.mode === 'dark' 
                        ? '1px solid rgba(255, 255, 255, 0.08)' 
                        : '1px solid rgba(0, 0, 0, 0.06)',
                    background: theme.palette.mode === 'dark' 
                        ? 'rgba(17, 27, 43, 0.85)' 
                        : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Stunning Logo Header */}
                <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BubbleChartIcon sx={{ 
                            fontSize: 32, 
                            color: 'primary.main',
                            filter: 'drop-shadow(0 0 8px rgba(152, 217, 255, 0.6))',
                            animation: 'pulse 2s infinite ease-in-out',
                            '@keyframes pulse': {
                                '0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
                                '50%': { transform: 'scale(1.1)', opacity: 1 },
                            }
                        }} />
                        <Typography 
                            variant="h5" 
                            component="h1" 
                            sx={{ 
                                fontWeight: 800, 
                                letterSpacing: '0.5px',
                                background: 'linear-gradient(135deg, #98D9FF 0%, #C88BFF 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 30px rgba(200, 139, 255, 0.1)',
                            }}
                        >
                            Bubble
                        </Typography>
                    </Box>
                    <ThemeToggle />
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', mx: 2, mb: 1 }} />

                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <ScrollBar onConversationSelect={onConversationSelect} />
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', mx: 2, mt: 1 }} />

                {/* Premium Account Profile Footer */}
                <Box sx={{ p: 2 }}>
                    <ListItemButton
                        onClick={handleMenuClick}
                        sx={{
                            p: 1.5,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderColor: 'primary.main',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px rgba(152, 217, 255, 0.12)',
                            },
                        }}
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <ListItemAvatar>
                            <Avatar 
                                src={getImageUrl(currentUser?.profilePic)}
                                sx={{ 
                                    border: '2px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s ease',
                                    '.MuiListItemButton-root:hover &': {
                                        borderColor: 'primary.main',
                                        boxShadow: '0 0 10px rgba(152, 217, 255, 0.4)',
                                    }
                                }}
                            >
                                {getInitials(currentUser?.username)}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                            primary={
                                <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                                    {currentUser?.username || 'User'}
                                </Typography>
                            } 
                            secondary={
                                <Typography noWrap variant="caption" sx={{ color: 'text.secondary', opacity: 0.7 }}>
                                    {currentUser?.bio || 'Click to view profile'}
                                </Typography>
                            }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, opacity: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '10px' }}>▲</Typography>
                        </Box>
                    </ListItemButton>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                    slotProps={{
                        paper: {
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mb: 1.5,
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                            },
                        }
                    }}
                >
                    <MenuItem onClick={handleProfile} sx={{ gap: 1 }}>
                        <ListItemIcon sx={{ minWidth: 'auto !important' }}>
                            <AccountCircleIcon fontSize="small" />
                        </ListItemIcon>
                        Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
                        <ListItemIcon sx={{ minWidth: 'auto !important' }}>
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