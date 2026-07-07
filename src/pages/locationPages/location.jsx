import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  IconButton,
  Fade,
  Stack,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  Refresh,
  CheckCircle,
  Cancel,
  GpsFixed,
  GpsOff,
  AccessTime,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { StyledPaper, LocationCard, StyledDialog } from '../../components/UI/locationcard';
import { useNavigate } from 'react-router-dom';






const LocationPage = () => {
  const [openConsent, setOpenConsent] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const navigate = useNavigate();

  // Check consent on mount
  useEffect(() => {
    const hasConsented = localStorage.getItem('locationConsent');
    if (hasConsented === 'true') {
      setConsentGiven(true);
    } else {
      setOpenConsent(true);
    }
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          formattedDate: new Date(position.timestamp).toLocaleString(),
        };
        setLocation(locationData);
        setLocationHistory(prev => [locationData, ...prev].slice(0, 5));
        setLoading(false);
        sendLocationToBackend(locationData);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Send location to backend
  const sendLocationToBackend = async (locationData) => {
    try {
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Location sent successfully:', data);
    } catch (err) {
      console.error('Error sending location to backend:', err);
      setError('Failed to send location to server');
    }
  };

  // Handle consent acceptance
  const handleAcceptConsent = () => {
    setConsentGiven(true);
    setOpenConsent(false);
    localStorage.setItem('locationConsent', 'true');
    getCurrentLocation();
    navigate('/chat');
  };

  // Handle consent rejection
  const handleRejectConsent = () => {
    setOpenConsent(false);
    localStorage.setItem('locationConsent', 'false');
    setError('Location access was denied');
    navigate('/chat');
  };

  // Refresh location
  const refreshLocation = () => {
    if (consentGiven) {
      getCurrentLocation();
    } else {
      setOpenConsent(true);
    }
  };

  // Format coordinates for display
  const formatCoordinate = (coord) => {
    return coord?.toFixed(6) || 'N/A';
  };

  return (
    <Container maxWidth="md">
      {/* Consent Dialog */}
      <StyledDialog
        open={openConsent}
        aria-labelledby="consent-dialog-title"
        aria-describedby="consent-dialog-description"
      >
        <DialogTitle id="consent-dialog-title">
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn color="primary" />
            <Typography variant="h5" component="span">
              Location Access Required
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="consent-dialog-description" component="div">
            <Typography variant="body1" paragraph>
              This application needs access to your location to provide 
              personalized services. Your location data will be used solely 
              for the purpose of this application and will be handled securely.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We respect your privacy and will never share your location data 
              without your explicit consent.
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>What we collect:</strong> Latitude, longitude, accuracy, 
                and timestamp. You can revoke this permission at any time 
                through your browser settings.
              </Typography>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleRejectConsent}
            color="error"
            variant="outlined"
            startIcon={<Cancel />}
            disabled={loading}
          >
            Decline
          </Button>
          <Button
            onClick={handleAcceptConsent}
            color="primary"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
            disabled={loading}
            autoFocus
          >
            {loading ? 'Getting location...' : 'Allow Access'}
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Main Content */}
      <Fade in={!openConsent} timeout={500}>
        <StyledPaper elevation={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <GpsFixed color="primary" />
              <Typography variant="h4" component="h1">
                Location Services
              </Typography>
            </Box>
            <Chip
              label={consentGiven ? 'Access Granted' : 'Access Pending'}
              color={consentGiven ? 'success' : 'warning'}
              icon={consentGiven ? <CheckCircle /> : <AccessTime />}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Status and Controls */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MyLocation />}
                  onClick={refreshLocation}
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Getting Location...' : 'Get My Location'}
                </Button>
                {location && (
                  <Tooltip title="Refresh location">
                    <IconButton onClick={refreshLocation} disabled={loading}>
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Chip
                  label={loading ? 'Loading...' : consentGiven ? 'Ready' : 'Waiting'}
                  color={loading ? 'warning' : consentGiven ? 'success' : 'default'}
                  size="medium"
                />
              </Box>
            </Grid>
          </Grid>

          {loading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Acquiring location data...
              </Typography>
            </Box>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }} onClose={() => setError(null)}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Location Data Display */}
          {location && (
            <LocationCard elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Location Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <GpsFixed fontSize="small" />
                      <Typography variant="body2" color="inherit" fontWeight="bold">
                        Latitude:
                      </Typography>
                      <Typography variant="body2" color="inherit">
                        {formatCoordinate(location.latitude)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <GpsFixed fontSize="small" />
                      <Typography variant="body2" color="inherit" fontWeight="bold">
                        Longitude:
                      </Typography>
                      <Typography variant="body2" color="inherit">
                        {formatCoordinate(location.longitude)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <GpsOff fontSize="small" />
                      <Typography variant="body2" color="inherit" fontWeight="bold">
                        Accuracy:
                      </Typography>
                      <Typography variant="body2" color="inherit">
                        {location.accuracy ? `${location.accuracy.toFixed(0)} meters` : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTime fontSize="small" />
                      <Typography variant="body2" color="inherit" fontWeight="bold">
                        Time:
                      </Typography>
                      <Typography variant="body2" color="inherit">
                        {location.formattedDate}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </LocationCard>
          )}

          {/* Location History */}
          {locationHistory.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Location History
              </Typography>
              <Stack spacing={1}>
                {locationHistory.map((loc, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{ p: 1.5, bgcolor: 'grey.50' }}
                  >
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          {loc.formattedDate}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="body2">
                          {formatCoordinate(loc.latitude)}, {formatCoordinate(loc.longitude)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* Instructions */}
          {!location && !error && !loading && (
            <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                <GpsOff sx={{ mr: 1, verticalAlign: 'middle' }} />
                No location data available yet. Click the button above to get your location.
              </Typography>
            </Box>
          )}

          {/* Back to Chat Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ChatIcon />}
              onClick={() => navigate('/chat')}
              sx={{ borderRadius: '50px', px: 3 }}
            >
              Back to Chat
            </Button>
          </Box>

        </StyledPaper>
      </Fade>
    </Container>
  );
};

export default LocationPage;