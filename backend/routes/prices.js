const express = require('express');
const router = express.Router();
const Price = require('../models/Price');

router.get('/compare/:productId', async (req, res) => {
  try {
    const prices = await Price.find({ product: req.params.productId })
      .populate('store')
      .sort('price');
    
    if (prices.length === 0) {
      return res.status(404).json({ message: 'No prices found for this product' });
    }
    
    const lowestPrice = prices[0].price;
    const highestPrice = prices[prices.length - 1].price;
    const averagePrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
    
    res.json({
      prices,
      statistics: {
        lowestPrice,
        highestPrice,
        averagePrice: averagePrice.toFixed(2),
        priceRange: (highestPrice - lowestPrice).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/history/:productId/:storeId', async (req, res) => {
  try {
    const { productId, storeId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const priceHistory = await Price.find({
      product: productId,
      store: storeId,
      createdAt: { $gte: startDate }
    }).sort('createdAt');
    
    res.json(priceHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product, store, price } = req.body;
    
    const existingPrice = await Price.findOne({ product, store });
    
    if (existingPrice) {
      if (existingPrice.price !== price) {
        existingPrice.previousPrice = existingPrice.price;
        existingPrice.price = price;
        existingPrice.discount = existingPrice.previousPrice - price;
        existingPrice.discountPercentage = ((existingPrice.discount / existingPrice.previousPrice) * 100).toFixed(2);
        existingPrice.lastUpdated = Date.now();
        
        const updatedPrice = await existingPrice.save();
        
        const io = req.app.get('io');
        io.emit('priceUpdate', {
          productId: product,
          storeId: store,
          newPrice: price,
          previousPrice: existingPrice.previousPrice
        });
        
        res.json(updatedPrice);
      } else {
        res.json(existingPrice);
      }
    } else {
      const newPrice = new Price(req.body);
      const savedPrice = await newPrice.save();
      res.status(201).json(savedPrice);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/deals', async (req, res) => {
  try {
    const { minDiscount = 10 } = req.query;
    
    const deals = await Price.find({
      discountPercentage: { $gte: minDiscount }
    })
    .populate('product')
    .populate('store')
    .sort('-discountPercentage')
    .limit(50);
    
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;