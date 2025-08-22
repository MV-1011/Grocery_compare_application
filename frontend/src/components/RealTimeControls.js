import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import { PlayArrow, Stop, Refresh } from '@mui/icons-material';
import { scraperAPI } from '../services/api';
import { 
  subscribeToScheduledUpdates, 
  subscribeToPriceUpdateResponse,
  subscribeToPriceUpdateError,
  requestPriceUpdate 
} from '../services/socket';

const Realtimecontrols = () => {
  const [status, setStatus] = useState({ isRunning: false, supportedStores: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [productName, setProductName] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [liveResults, setLiveResults] = useState([]);

  useEffect(() => {
    fetchStatus();
    
    const unsubscribeScheduled = subscribeToScheduledUpdates((data) => {
      setLastUpdate(data);
      setSuccess(`Scheduled update completed: ${data.productsUpdated} products updated`);
    });

    const unsubscribeResponse = subscribeToPriceUpdateResponse((data) => {
      setLiveResults(data.results);
      setSuccess(`Live data fetched for ${data.productName}: ${data.results.length} results`);
    });

    const unsubscribeError = subscribeToPriceUpdateError((data) => {
      setError(`Live update error: ${data.error}`);
    });

    return () => {
      unsubscribeScheduled();
      unsubscribeResponse();
      unsubscribeError();
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await scraperAPI.getRealTimeStatus();
      setStatus(response.data);
    } catch (error) {
      setError('Failed to fetch status');
    }
  };

  const startRealTime = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const productNames = productName ? [productName] : [];
      await scraperAPI.startRealTime(productNames, intervalMinutes);
      setSuccess('Real-time monitoring started successfully');
      fetchStatus();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start real-time monitoring');
    } finally {
      setLoading(false);
    }
  };

  const stopRealTime = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await scraperAPI.stopRealTime();
      setSuccess('Real-time monitoring stopped successfully');
      fetchStatus();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to stop real-time monitoring');
    } finally {
      setLoading(false);
    }
  };

  const scrapeLive = async () => {
    if (!productName.trim()) {
      setError('Please enter a product name');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await scraperAPI.scrapeLive(productName);
      setLiveResults(response.data.data);
      setSuccess(`Live scraping completed: ${response.data.results} results found`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to scrape live data');
    } finally {
      setLoading(false);
    }
  };

  const requestLiveUpdate = () => {
    if (!productName.trim()) {
      setError('Please enter a product name');
      return;
    }
    
    requestPriceUpdate(productName);
    setSuccess('Live update requested via socket...');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Real-Time Price Monitoring
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Monitoring Status
              </Typography>
              <FormControlLabel
                control={<Switch checked={status.isRunning} disabled />}
                label={status.isRunning ? 'Running' : 'Stopped'}
              />
              <Typography variant="body2" color="text.secondary">
                Supported Stores: {status.supportedStores.join(', ')}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Bread, Milk, Eggs"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                type="number"
                label="Update Interval (minutes)"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(parseInt(e.target.value))}
                inputProps={{ min: 5, max: 1440 }}
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={status.isRunning ? <Stop /> : <PlayArrow />}
                onClick={status.isRunning ? stopRealTime : startRealTime}
                disabled={loading}
                sx={{ mr: 1, mb: 1 }}
              >
                {status.isRunning ? 'Stop Monitoring' : 'Start Monitoring'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={scrapeLive}
                disabled={loading || !productName.trim()}
                sx={{ mr: 1, mb: 1 }}
              >
                Scrape Now
              </Button>

              <Button
                variant="outlined"
                onClick={requestLiveUpdate}
                disabled={!productName.trim()}
                sx={{ mb: 1 }}
              >
                Socket Update
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            {lastUpdate && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Last Scheduled Update
                </Typography>
                <Typography variant="body2">
                  Time: {new Date(lastUpdate.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Products Updated: {lastUpdate.productsUpdated}
                </Typography>
              </Box>
            )}

            {liveResults.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Live Results ({liveResults.length})
                </Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {liveResults.map((result, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 1, p: 1 }}>
                      <Typography variant="subtitle2">{result.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={result.store} 
                          size="small" 
                          color="primary"
                        />
                        <Chip 
                          label={`£${result.price}`} 
                          size="small" 
                          color="secondary"
                        />
                        <Chip 
                          label={result.inStock ? 'In Stock' : 'Out of Stock'} 
                          size="small" 
                          color={result.inStock ? 'success' : 'error'}
                        />
                        {result.isMockData && (
                          <Chip 
                            label="Mock" 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};



export default Realtimecontrols;