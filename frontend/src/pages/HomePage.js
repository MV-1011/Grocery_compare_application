import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
  Paper,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { productAPI, storeAPI } from '../services/api';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RealTimeControls from '../components/RealTimeControls';

const categories = [
  'Fresh & Chilled',
  'Bakery',
  'Dairy & Eggs',
  'Meat & Fish',
  'Fruit & Vegetables',
  'Frozen',
  'Drinks',
  'Household',
  'Health & Beauty',
  'Baby & Toddler'
];

function HomePage() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, storesRes] = await Promise.all([
        productAPI.getAll({ limit: 8 }),
        storeAPI.getAll()
      ]);
      setFeaturedProducts(productsRes.data.products || []);
      setStores(storesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/search?category=${encodeURIComponent(category)}`);
  };

  const handleCompareClick = (productId) => {
    navigate(`/compare/${productId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Compare Grocery Prices Across UK Stores
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Find the best deals from Tesco, Sainsbury's, ASDA, Morrisons, and more
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Our Partner Stores
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
          {['Tesco', 'Sainsburys', 'ASDA', 'Morrisons', 'Waitrose', 'Iceland'].map((store) => (
            <Chip
              key={store}
              label={store}
              variant="filled"
              sx={{ 
                fontSize: '1rem', 
                p: 2,
                background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            />
          ))}
        </Box>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Browse Categories
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={3} key={category}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
                  border: '2px solid #E2E8F0',
                  '&:hover': { 
                    border: '2px solid #1565C0',
                    boxShadow: '0 8px 25px rgba(21, 101, 192, 0.15)',
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body1">
                    {category}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Featured Products
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {loading ? (
            [...Array(8)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={140} />
                  <CardContent>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                <Card sx={{ 
                  height: '440px',
                  display: 'flex', 
                  flexDirection: 'column',
                  width: '100%',
                  maxWidth: '100%'
                }}>
                  <CardMedia
                    component="img"
                    image={product.image ? `http://localhost:5005${product.image}` : '/placeholder.jpg'}
                    alt={product.name}
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
                      {product.name || 'Sample Product'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        height: '1.2em',
                        lineHeight: '1.2em'
                      }}
                    >
                      {product.category || 'General'}
                    </Typography>
                    <Box sx={{ mt: 'auto', height: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      {product.brand && (
                        <Chip 
                          label={product.brand} 
                          size="small"
                          variant="filled"
                          sx={{ 
                            height: '24px',
                            maxWidth: '100%',
                            mb: 0.5,
                            backgroundColor: '#FF5722',
                            color: 'white',
                            fontWeight: 600,
                            '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }
                          }} 
                        />
                      )}
                      {product.unit && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            height: '1em',
                            lineHeight: '1em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {product.unit}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ 
                    height: '80px',
                    justifyContent: 'center', 
                    p: 2,
                    flexShrink: 0
                  }}>
                    <Button 
                      size="small" 
                      startIcon={<CompareArrowsIcon />}
                      onClick={() => handleCompareClick(product._id)}
                      fullWidth
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 16px rgba(21, 101, 192, 0.3)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      Compare Prices
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No products available yet. Please add some products to get started.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <RealTimeControls />
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          background: 'linear-gradient(45deg, #2E7D32 30%, #66BB6A 90%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <TrendingDownIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Save Money on Every Shop
        </Typography>
        <Typography variant="body1">
          Our real-time price comparison helps you find the best deals across all major UK grocery stores.
          Start comparing now and save on your weekly shop!
        </Typography>
      </Paper>
    </Container>
  );
}

export default HomePage;