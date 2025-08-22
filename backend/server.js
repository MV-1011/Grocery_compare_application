const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
const RealTimeScraper = require('./utils/realTimeScraper');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3003",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const productRoutes = require('./routes/products');
const storeRoutes = require('./routes/stores');
const priceRoutes = require('./routes/prices');
const scraperRoutes = require('./routes/scraper');

app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/scraper', scraperRoutes);

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('requestPriceUpdate', async (data) => {
    const scraper = app.get('realTimeScraper');
    if (scraper) {
      try {
        const results = await scraper.scrapeAllStores(data.productName);
        socket.emit('priceUpdateResponse', { productName: data.productName, results });
      } catch (error) {
        socket.emit('priceUpdateError', { error: error.message });
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.set('io', io);

let globalScraper = null;

cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled price update every 6 hours');
  try {
    if (!globalScraper) {
      globalScraper = new RealTimeScraper(io);
    }
    
    const Product = require('./models/Product');
    const products = await Product.find().limit(20).select('name');
    const productNames = products.map(p => p.name);
    
    for (const productName of productNames) {
      const results = await globalScraper.scrapeAllStores(productName);
      if (results.length > 0) {
        await globalScraper.updateDatabasePrices(results);
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    io.emit('scheduledUpdateComplete', { 
      message: 'Scheduled price update completed',
      productsUpdated: productNames.length,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Scheduled update failed:', error);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Scheduled price updates will run every 6 hours');
});

module.exports = { app, io };