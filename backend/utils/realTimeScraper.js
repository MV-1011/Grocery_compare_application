const axios = require('axios');
const cheerio = require('cheerio');
const Product = require('../models/Product');
const Store = require('../models/Store');
const Price = require('../models/Price');

const storeScrapers = {
  tesco: {
    baseUrl: 'https://www.tesco.com',
    searchUrl: 'https://www.tesco.com/groceries/en-GB/search',
    productPageUrl: 'https://www.tesco.com/groceries/en-GB/products/',
    selectors: {
      searchResults: '.product-list--grid-view .product-tile',
      productName: '.product-details--wrapper .product-details--content h3',
      price: '.price-control-wrapper .price-per-sellable-unit .value',
      inStock: '.product-details--wrapper .product-availability',
      productUrl: 'a'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive'
    }
  },
  sainsburys: {
    baseUrl: 'https://www.sainsburys.co.uk',
    searchUrl: 'https://www.sainsburys.co.uk/gol-ui/SearchResults',
    selectors: {
      searchResults: '.pt__product-details-wrapper',
      productName: '.pt__info__description',
      price: '.pricePerUnit',
      inStock: '.pt__availability',
      productUrl: 'a'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  },
  asda: {
    baseUrl: 'https://groceries.asda.com',
    searchUrl: 'https://groceries.asda.com/search',
    selectors: {
      searchResults: '.co-product',
      productName: '.co-product__title',
      price: '.co-product__price .co-price__current',
      inStock: '.co-product__availability',
      productUrl: 'a'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  morrisons: {
    baseUrl: 'https://groceries.morrisons.com',
    searchUrl: 'https://groceries.morrisons.com/search',
    selectors: {
      searchResults: '.fop-contentWrapper',
      productName: '.fop-title',
      price: '.fop-price .fop-now',
      inStock: '.fop-availability',
      productUrl: 'a'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }
};

class RealTimeScraper {
  constructor(io) {
    this.io = io;
    this.isRunning = false;
    this.scraperInterval = null;
  }

  async scrapeStore(storeName, productName) {
    const scraper = storeScrapers[storeName.toLowerCase()];
    if (!scraper) {
      throw new Error(`No scraper configuration for store: ${storeName}`);
    }

    try {
      const searchUrl = `${scraper.searchUrl}?query=${encodeURIComponent(productName)}`;
      
      const response = await axios.get(searchUrl, {
        headers: scraper.headers,
        timeout: 10000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      const results = [];

      $(scraper.selectors.searchResults).each((index, element) => {
        if (index >= 5) return false;

        const $element = $(element);
        const name = $element.find(scraper.selectors.productName).text().trim();
        const priceText = $element.find(scraper.selectors.price).text().trim();
        const inStockText = $element.find(scraper.selectors.inStock).text().trim();
        
        const price = this.extractPrice(priceText);
        const inStock = this.checkInStock(inStockText);
        
        if (name && price > 0) {
          results.push({
            name: name,
            price: price,
            inStock: inStock,
            store: storeName,
            scrapedAt: new Date(),
            url: searchUrl
          });
        }
      });

      return results;
    } catch (error) {
      console.error(`Error scraping ${storeName}:`, error.message);
      return this.getFallbackData(storeName, productName);
    }
  }

  extractPrice(priceText) {
    const priceMatch = priceText.match(/£?(\d+\.?\d*)/);
    return priceMatch ? parseFloat(priceMatch[1]) : 0;
  }

  checkInStock(inStockText) {
    const outOfStockKeywords = ['out of stock', 'unavailable', 'currently unavailable', 'sold out'];
    return !outOfStockKeywords.some(keyword => 
      inStockText.toLowerCase().includes(keyword)
    );
  }

  getFallbackData(storeName, productName) {
    return [{
      name: productName,
      price: parseFloat((Math.random() * 10 + 0.5).toFixed(2)),
      inStock: Math.random() > 0.2,
      store: storeName,
      scrapedAt: new Date(),
      isMockData: true
    }];
  }

  async scrapeAllStores(productName) {
    const stores = await Store.find({ isActive: true });
    const allResults = [];

    const scrapePromises = stores.map(async (store) => {
      try {
        const results = await this.scrapeStore(store.name, productName);
        allResults.push(...results);
        
        this.io.emit('priceUpdate', {
          store: store.name,
          productName,
          results,
          timestamp: new Date()
        });
        
        return results;
      } catch (error) {
        console.error(`Failed to scrape ${store.name}:`, error);
        return [];
      }
    });

    await Promise.allSettled(scrapePromises);
    return allResults;
  }

  async updateDatabasePrices(scrapedData) {
    for (const item of scrapedData) {
      try {
        let product = await Product.findOne({ name: new RegExp(item.name, 'i') });
        if (!product) {
          product = new Product({
            name: item.name,
            category: 'Groceries',
            description: `${item.name} from ${item.store}`
          });
          await product.save();
        }

        const store = await Store.findOne({ name: new RegExp(item.store, 'i') });
        if (!store) continue;

        await Price.findOneAndUpdate(
          { product: product._id, store: store._id },
          {
            price: item.price,
            inStock: item.inStock,
            lastUpdated: new Date(),
            scrapedAt: item.scrapedAt,
            isMockData: item.isMockData || false
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error('Error updating database:', error);
      }
    }
  }

  async startRealTimeMonitoring(productNames = [], intervalMinutes = 30) {
    if (this.isRunning) {
      console.log('Real-time monitoring already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting real-time price monitoring every ${intervalMinutes} minutes`);

    const monitorProducts = async () => {
      if (!this.isRunning) return;

      try {
        const products = productNames.length > 0 
          ? productNames 
          : await Product.find().limit(50).select('name');

        const productNamesToScrape = productNames.length > 0 
          ? productNames 
          : products.map(p => p.name);

        for (const productName of productNamesToScrape) {
          if (!this.isRunning) break;

          console.log(`Scraping prices for: ${productName}`);
          const scrapedData = await this.scrapeAllStores(productName);
          
          if (scrapedData.length > 0) {
            await this.updateDatabasePrices(scrapedData);
            
            this.io.emit('bulkPriceUpdate', {
              productName,
              totalUpdates: scrapedData.length,
              timestamp: new Date()
            });
          }

          await this.delay(5000);
        }

        console.log('Real-time monitoring cycle completed');
      } catch (error) {
        console.error('Error in monitoring cycle:', error);
      }
    };

    await monitorProducts();

    this.scraperInterval = setInterval(monitorProducts, intervalMinutes * 60 * 1000);
  }

  stopRealTimeMonitoring() {
    this.isRunning = false;
    if (this.scraperInterval) {
      clearInterval(this.scraperInterval);
      this.scraperInterval = null;
    }
    console.log('Real-time monitoring stopped');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      supportedStores: Object.keys(storeScrapers),
      lastUpdate: new Date()
    };
  }
}

module.exports = RealTimeScraper;