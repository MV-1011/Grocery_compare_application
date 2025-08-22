import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  TextField,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  InputAdornment
} from '@mui/material';
import { productAPI } from '../services/api';
import SearchIcon from '@mui/icons-material/Search';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FilterListIcon from '@mui/icons-material/FilterList';

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const searchQuery = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';
  
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter, page]);

  const fetchCategories = async () => {
    try {
      const res = await productAPI.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12
      };
      
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;
      
      const res = await productAPI.getAll(params);
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (localSearchQuery) params.set('q', localSearchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    setSearchParams(params);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    const params = new URLSearchParams(searchParams);
    if (newCategory) {
      params.set('category', newCategory);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
    setPage(1);
  };

  const handleCompareClick = (productId) => {
    navigate(`/compare/${productId}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search for products..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                fullWidth 
                variant="contained" 
                type="submit"
                size="large"
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {(searchQuery || categoryFilter) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Search Results
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {searchQuery && (
              <Chip 
                label={`Search: ${searchQuery}`} 
                onDelete={() => {
                  setLocalSearchQuery('');
                  const params = new URLSearchParams(searchParams);
                  params.delete('q');
                  setSearchParams(params);
                }}
              />
            )}
            {categoryFilter && (
              <Chip 
                label={`Category: ${categoryFilter}`} 
                onDelete={() => {
                  setSelectedCategory('');
                  const params = new URLSearchParams(searchParams);
                  params.delete('category');
                  setSearchParams(params);
                }}
              />
            )}
          </Box>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : products.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No products found. Try adjusting your search criteria.
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {products.map((product) => (
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
                      {product.name}
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
                      {product.category}
                    </Typography>
                    <Box sx={{ mt: 'auto', height: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      {product.brand && (
                        <Chip 
                          label={product.brand} 
                          size="small" 
                          sx={{ 
                            height: '24px',
                            maxWidth: '100%',
                            mb: 0.5,
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
                      fullWidth
                      variant="contained"
                      startIcon={<CompareArrowsIcon />}
                      onClick={() => handleCompareClick(product._id)}
                    >
                      Compare Prices
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default SearchResults;