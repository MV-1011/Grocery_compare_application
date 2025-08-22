import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductComparison from './pages/ProductComparison';
import DealsPage from './pages/DealsPage';
import SearchResults from './pages/SearchResults';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
      light: '#5E92F3',
      dark: '#003C8F',
    },
    secondary: {
      main: '#FF5722',
      light: '#FF8A50',
      dark: '#D84315',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#2E7D32',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#1E293B',
    },
    h5: {
      fontWeight: 600,
      color: '#1E293B',
    },
    h6: {
      fontWeight: 600,
      color: '#1E293B',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #E2E8F0',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 20px',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/compare/:productId" element={<ProductComparison />} />
          <Route path="/deals" element={<DealsPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;