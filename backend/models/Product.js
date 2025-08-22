const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  brand: String,
  barcode: String,
  image: String,
  unit: String,
  description: String
}, { timestamps: true });

productSchema.index({ name: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);