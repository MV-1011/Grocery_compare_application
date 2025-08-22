import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { priceAPI, productAPI } from '../services/api';
import { subscribeToUpdates } from '../services/socket';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

function ProductComparison() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [priceComparison, setPriceComparison] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    fetchData();
    
    const unsubscribe = subscribeToUpdates((update) => {
      if (update.productId === productId) {
        fetchPriceComparison();
      }
    });
    
    return unsubscribe;
  }, [productId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productRes, priceRes] = await Promise.all([
        productAPI.getById(productId),
        priceAPI.compareProduct(productId)
      ]);
      
      setProduct(productRes.data);
      setPriceComparison(priceRes.data);
      
      if (priceRes.data.prices && priceRes.data.prices.length > 0) {
        fetchPriceHistory(priceRes.data.prices[0].store._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceComparison = async () => {
    try {
      const priceRes = await priceAPI.compareProduct(productId);
      setPriceComparison(priceRes.data);
    } catch (err) {
      console.error('Error fetching price comparison:', err);
    }
  };

  const fetchPriceHistory = async (storeId) => {
    try {
      setSelectedStore(storeId);
      const historyRes = await priceAPI.getPriceHistory(productId, storeId, 30);
      
      const formattedData = historyRes.data.map(item => ({
        date: new Date(item.createdAt).toLocaleDateString(),
        price: item.price
      }));
      
      setPriceHistory(formattedData);
    } catch (err) {
      console.error('Error fetching price history:', err);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!priceComparison || !priceComparison.prices || priceComparison.prices.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">No price information available for this product.</Alert>
      </Container>
    );
  }

  const { prices, statistics } = priceComparison;
  const lowestPrice = prices[0];
  const savings = parseFloat(statistics.priceRange);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <CardMedia
              component="img"
              image={product?.image ? `http://localhost:5005${product.image}` : '/placeholder.jpg'}
              alt={product?.name}
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 2
              }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="h4" gutterBottom>
              {product?.name || 'Product'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={product?.category || 'General'} color="primary" />
              {product?.brand && <Chip label={product.brand} variant="outlined" />}
              {product?.unit && <Chip label={product.unit} variant="outlined" />}
            </Box>
            {product?.description && (
              <Typography variant="body1" color="text.secondary">
                {product.description}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Best Price
                </Typography>
                <Typography variant="h3">
                  £{lowestPrice.price.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  at {lowestPrice.store.name}
                </Typography>
                {savings > 0 && (
                  <Chip 
                    label={`Save up to £${savings}`}
                    color="secondary"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Price Comparison
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Store</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Stock</TableCell>
                    <TableCell align="right">Difference</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prices.map((priceInfo, index) => (
                    <TableRow 
                      key={priceInfo.store._id}
                      sx={{ 
                        bgcolor: index === 0 ? 'success.light' : 'inherit',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => fetchPriceHistory(priceInfo.store._id)}
                    >
                      <TableCell>
                        <Typography variant="body1" fontWeight={index === 0 ? 'bold' : 'normal'}>
                          {priceInfo.store.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight={index === 0 ? 'bold' : 'normal'}>
                          £{priceInfo.price.toFixed(2)}
                        </Typography>
                        {priceInfo.previousPrice && priceInfo.previousPrice !== priceInfo.price && (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.5 }}>
                            {priceInfo.price < priceInfo.previousPrice ? (
                              <TrendingDownIcon color="success" fontSize="small" />
                            ) : (
                              <TrendingUpIcon color="error" fontSize="small" />
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                              was £{priceInfo.previousPrice.toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {priceInfo.inStock ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {index === 0 ? (
                          <Chip label="Lowest" color="success" size="small" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            +£{(priceInfo.price - lowestPrice.price).toFixed(2)}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Price Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Lowest Price
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      £{statistics.lowestPrice.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Highest Price
                    </Typography>
                    <Typography variant="h5" color="error.main">
                      £{statistics.highestPrice.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Average Price
                    </Typography>
                    <Typography variant="h5">
                      £{statistics.averagePrice}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Price Range
                    </Typography>
                    <Typography variant="h5" color="warning.main">
                      £{statistics.priceRange}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {priceHistory.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Price History (30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    name="Price (£)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default ProductComparison;