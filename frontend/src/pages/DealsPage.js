import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Box,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { priceAPI } from '../services/api';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TimerIcon from '@mui/icons-material/Timer';

function DealsPage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minDiscount, setMinDiscount] = useState(10);
  const [sortBy, setSortBy] = useState('discount');

  useEffect(() => {
    fetchDeals();
  }, [minDiscount]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await priceAPI.getDeals(minDiscount);
      let dealsData = res.data || [];
      
      if (dealsData.length === 0) {
        const mockDeals = generateMockDeals();
        dealsData = mockDeals;
      }
      
      setDeals(dealsData);
    } catch (err) {
      setError('Failed to fetch deals');
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockDeals = () => {
    const products = [
      'Heinz Baked Beans 400g', 'Warburtons Bread', 'Cadbury Dairy Milk 200g',
      'Walkers Crisps Multipack', 'Cathedral City Cheese 350g', 'Lurpak Butter 250g',
      'Kelloggs Corn Flakes 500g', 'PG Tips Tea Bags 240', 'Nescafe Gold Coffee 200g'
    ];
    
    const stores = ['Tesco', 'Sainsburys', 'ASDA', 'Morrisons'];
    
    return products.map((product, index) => ({
      _id: `deal_${index}`,
      product: {
        _id: `product_${index}`,
        name: product,
        category: 'Groceries'
      },
      store: {
        _id: `store_${index % stores.length}`,
        name: stores[index % stores.length]
      },
      price: (Math.random() * 5 + 1).toFixed(2),
      previousPrice: (Math.random() * 3 + 4).toFixed(2),
      discountPercentage: Math.floor(Math.random() * 40 + minDiscount),
      discount: (Math.random() * 2 + 0.5).toFixed(2)
    }));
  };

  const handleCompareClick = (productId) => {
    navigate(`/compare/${productId}`);
  };

  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    
    const sortedDeals = [...deals].sort((a, b) => {
      if (newSortBy === 'discount') {
        return b.discountPercentage - a.discountPercentage;
      } else if (newSortBy === 'price') {
        return a.price - b.price;
      } else if (newSortBy === 'savings') {
        return b.discount - a.discount;
      }
      return 0;
    });
    
    setDeals(sortedDeals);
  };

  const handleDiscountChange = (event, newValue) => {
    setMinDiscount(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <LocalOfferIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Today's Best Deals
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Save big on your favorite products across all UK stores
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Minimum Discount: {minDiscount}%</Typography>
            <Slider
              value={minDiscount}
              onChange={handleDiscountChange}
              aria-labelledby="discount-slider"
              valueLabelDisplay="auto"
              step={5}
              marks
              min={5}
              max={50}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="discount">Highest Discount %</MenuItem>
                <MenuItem value="savings">Highest Savings £</MenuItem>
                <MenuItem value="price">Lowest Price</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : deals.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No deals found with minimum {minDiscount}% discount. Try lowering the discount filter.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {deals.map((deal) => (
            <Grid item xs={12} sm={6} md={3} key={deal._id}>
              <Card 
                sx={{ 
                  height: '440px',
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  width: '100%',
                  maxWidth: '100%',
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1
                  }}
                >
                  <Chip
                    label={`${deal.discountPercentage}% OFF`}
                    icon={<TrendingDownIcon />}
                    sx={{ 
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                </Box>
                
                <CardMedia
                  component="img"
                  image={deal.product?.image ? `http://localhost:5005${deal.product.image}` : '/placeholder.jpg'}
                  alt={deal.product?.name}
                  sx={{
                    height: 200,
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                />
                
                <CardContent sx={{ 
                  height: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2,
                  flexShrink: 0
                }}>
                  <Typography 
                    variant="h6" 
                    component="h2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      height: '3.6em',
                      lineHeight: '1.8em',
                      fontSize: '1rem',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    {deal.product?.name || 'Product'}
                  </Typography>
                  
                  <Box sx={{ mb: 1, height: '32px', display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label={deal.store?.name || 'Store'} 
                      size="small" 
                      variant="filled"
                      sx={{ 
                        height: '24px',
                        background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1, mt: 'auto' }}>
                    <Typography variant="h4" color="success.main" sx={{ fontSize: '1.8rem' }}>
                      £{deal.price}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through', fontSize: '0.9rem' }}
                    >
                      £{deal.previousPrice}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '24px' }}>
                    <Chip
                      label={`Save £${deal.discount}`}
                      size="small"
                      variant="filled"
                      sx={{ 
                        height: '20px',
                        background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <TimerIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Limited time
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ 
                  height: '80px',
                  justifyContent: 'center', 
                  p: 2,
                  flexShrink: 0
                }}>
                  <Button 
                    fullWidth
                    variant="contained"
                    startIcon={<CompareArrowsIcon />}
                    onClick={() => handleCompareClick(deal.product?._id)}
                    sx={{
                      background: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #D84315 0%, #FF5722 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 16px rgba(255, 87, 34, 0.3)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Compare All Prices
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Paper 
        elevation={3} 
        sx={{ 
          mt: 4,
          p: 3, 
          background: 'linear-gradient(45deg, #FF6B6B 30%, #FFE66D 90%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" gutterBottom>
          Deal Updates in Real-Time
        </Typography>
        <Typography variant="body1">
          Our system continuously monitors prices across all major UK grocery stores.
          Check back regularly for new deals and price drops!
        </Typography>
      </Paper>
    </Container>
  );
}

export default DealsPage;