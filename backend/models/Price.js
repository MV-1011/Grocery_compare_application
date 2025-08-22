const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  previousPrice: Number,
  discount: Number,
  discountPercentage: Number,
  inStock: {
    type: Boolean,
    default: true
  },
  url: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

priceSchema.index({ product: 1, store: 1 });
priceSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('Price', priceSchema);