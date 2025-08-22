import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories/list'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const storeAPI = {
  getAll: () => api.get('/stores'),
  getById: (id) => api.get(`/stores/${id}`),
  create: (data) => api.post('/stores', data),
  update: (id, data) => api.put(`/stores/${id}`, data),
  delete: (id) => api.delete(`/stores/${id}`),
};

export const priceAPI = {
  compareProduct: (productId) => api.get(`/prices/compare/${productId}`),
  getPriceHistory: (productId, storeId, days = 30) => 
    api.get(`/prices/history/${productId}/${storeId}`, { params: { days } }),
  updatePrice: (data) => api.post('/prices', data),
  getDeals: (minDiscount) => api.get('/prices/deals', { params: { minDiscount } }),
};

export const scraperAPI = {
  scrapeProduct: (productName, storeNames) => 
    api.post('/scraper/scrape-product', { productName, storeNames }),
  updateAllPrices: () => api.post('/scraper/update-all-prices'),
  startRealTime: (productNames = [], intervalMinutes = 30) =>
    api.post('/scraper/start-realtime', { productNames, intervalMinutes }),
  stopRealTime: () => api.post('/scraper/stop-realtime'),
  getRealTimeStatus: () => api.get('/scraper/realtime-status'),
  scrapeLive: (productName) => api.post('/scraper/scrape-live', { productName }),
};

export default api;