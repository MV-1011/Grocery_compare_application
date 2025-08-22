const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const Product = require('../models/Product');
const Store = require('../models/Store');
const Price = require('../models/Price');
const RealTimeScraper = require('../utils/realTimeScraper');

const storeScrapers = {
  tesco: {
    searchUrl: 'https://www.tesco.com/groceries/en-GB/search',
    selectors: {
      productName: '.product-title',
      price: '.price-per-sellable-unit',
      image: '.product-image img'
    }
  },
  sainsburys: {
    searchUrl: 'https://www.sainsburys.co.uk/gol-ui/SearchResults',
    selectors: {
      productName: '.pt__info__description',
      price: '.pricePerUnit',
      image: '.pt__image img'
    }
  },
  asda: {
    searchUrl: 'https://groceries.asda.com/search',
    selectors: {
      productName: '.co-product__title',
      price: '.co-product__price',
      image: '.co-product__image img'
    }
  },
  morrisons: {
    searchUrl: 'https://groceries.morrisons.com/search',
    selectors: {
      productName: '.fop-title',
      price: '.fop-price',
      image: '.fop-img img'
    }
  }
};

router.post('/scrape-product', async (req, res) => {
  try {
    const { productName, storeNames } = req.body;
    const results = [];
    
    for (const storeName of storeNames) {
      if (storeScrapers[storeName.toLowerCase()]) {
        try {
          const scraper = storeScrapers[storeName.toLowerCase()];
          
          const mockData = {
            productName: productName,
            storeName: storeName,
            price: (Math.random() * 5 + 0.5).toFixed(2),
            inStock: Math.random() > 0.2,
            url: `${scraper.searchUrl}?query=${encodeURIComponent(productName)}`
          };
          
          results.push(mockData);
        } catch (scraperError) {
          console.error(`Error scraping ${storeName}:`, scraperError);
          results.push({
            storeName,
            error: 'Failed to scrape this store'
          });
        }
      }
    }
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/update-all-prices', async (req, res) => {
  try {
    const products = await Product.find().limit(100);
    const stores = await Store.find({ isActive: true });
    let updatedCount = 0;
    
    for (const product of products) {
      for (const store of stores) {
        const mockPrice = (Math.random() * 10 + 0.5).toFixed(2);
        
        await Price.findOneAndUpdate(
          { product: product._id, store: store._id },
          {
            price: parseFloat(mockPrice),
            inStock: Math.random() > 0.1,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
        
        updatedCount++;
      }
    }
    
    const io = req.app.get('io');
    io.emit('bulkPriceUpdate', { message: 'Prices updated', count: updatedCount });
    
    res.json({ message: `Updated ${updatedCount} prices` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/start-realtime', async (req, res) => {
  try {
    const io = req.app.get('io');
    const scraper = new RealTimeScraper(io);
    
    const { productNames = [], intervalMinutes = 30 } = req.body;
    
    req.app.set('realTimeScraper', scraper);
    
    await scraper.startRealTimeMonitoring(productNames, intervalMinutes);
    
    res.json({ 
      message: 'Real-time price monitoring started',
      intervalMinutes,
      productCount: productNames.length || 'all products'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/stop-realtime', async (req, res) => {
  try {
    const scraper = req.app.get('realTimeScraper');
    
    if (scraper) {
      scraper.stopRealTimeMonitoring();
      res.json({ message: 'Real-time monitoring stopped' });
    } else {
      res.status(400).json({ message: 'No active real-time monitoring found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/realtime-status', async (req, res) => {
  try {
    const scraper = req.app.get('realTimeScraper');
    
    if (scraper) {
      res.json(scraper.getStatus());
    } else {
      res.json({ 
        isRunning: false,
        supportedStores: ['tesco', 'sainsburys', 'asda', 'morrisons'],
        message: 'No active monitoring'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/scrape-live', async (req, res) => {
  try {
    const { productName } = req.body;
    const io = req.app.get('io');
    const scraper = new RealTimeScraper(io);
    
    const results = await scraper.scrapeAllStores(productName);
    
    if (results.length > 0) {
      await scraper.updateDatabasePrices(results);
    }
    
    res.json({ 
      message: `Scraped live data for ${productName}`,
      results: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;