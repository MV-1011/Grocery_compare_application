const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Store = require('./models/Store');
const Price = require('./models/Price');

dotenv.config();

const stores = [
  { name: 'Tesco', website: 'https://www.tesco.com', logo: 'tesco-logo.png' },
  { name: 'Sainsburys', website: 'https://www.sainsburys.co.uk', logo: 'sainsburys-logo.png' },
  { name: 'ASDA', website: 'https://www.asda.com', logo: 'asda-logo.png' },
  { name: 'Morrisons', website: 'https://www.morrisons.com', logo: 'morrisons-logo.png' },
  { name: 'Waitrose', website: 'https://www.waitrose.com', logo: 'waitrose-logo.png' },
  { name: 'Iceland', website: 'https://www.iceland.co.uk', logo: 'iceland-logo.png' }
];

const products = [
  { name: 'Whole Milk 2L', category: 'Dairy & Eggs', brand: 'Various', unit: '2L', image: '/images/products/milk.jpg' },
  { name: 'White Bread 800g', category: 'Bakery', brand: 'Warburtons', unit: '800g', image: '/images/products/bread.jpg' },
  { name: 'Free Range Eggs x12', category: 'Dairy & Eggs', brand: 'Happy Egg Co', unit: '12 pack', image: '/images/products/eggs.jpg' },
  { name: 'Chicken Breast 600g', category: 'Meat & Fish', brand: 'Various', unit: '600g', image: '/images/products/chicken.jpg' },
  { name: 'Bananas Loose', category: 'Fruit & Vegetables', brand: '', unit: 'per kg', image: '/images/products/bananas.jpg' },
  { name: 'Tomatoes 400g', category: 'Fruit & Vegetables', brand: '', unit: '400g', image: '/images/products/tomatoes.jpg' },
  { name: 'Baked Beans 400g', category: 'Food Cupboard', brand: 'Heinz', unit: '400g', image: '/images/products/baked-beans.jpg' },
  { name: 'Pasta 500g', category: 'Food Cupboard', brand: 'Barilla', unit: '500g', image: '/images/products/pasta.jpg' },
  { name: 'Orange Juice 1L', category: 'Drinks', brand: 'Tropicana', unit: '1L', image: '/images/products/orange-juice.jpg' },
  { name: 'Coffee 200g', category: 'Drinks', brand: 'Nescafe Gold', unit: '200g', image: '/images/products/coffee.jpg' },
  { name: 'Tea Bags 240', category: 'Drinks', brand: 'PG Tips', unit: '240 bags', image: '/images/products/tea.jpg' },
  { name: 'Butter 250g', category: 'Dairy & Eggs', brand: 'Lurpak', unit: '250g', image: '/images/products/butter.jpg' },
  { name: 'Cheese 350g', category: 'Dairy & Eggs', brand: 'Cathedral City', unit: '350g', image: '/images/products/cheese.jpg' },
  { name: 'Yogurt 500g', category: 'Dairy & Eggs', brand: 'Muller', unit: '500g', image: '/images/products/yogurt.jpg' },
  { name: 'Frozen Peas 1kg', category: 'Frozen', brand: 'Birds Eye', unit: '1kg', image: '/images/products/frozen-peas.jpg' },
  { name: 'Ice Cream 1L', category: 'Frozen', brand: 'Ben & Jerrys', unit: '1L', image: '/images/products/ice-cream.jpg' },
  { name: 'Pizza Margherita', category: 'Frozen', brand: 'Chicago Town', unit: '300g', image: '/images/products/pizza.jpg' },
  { name: 'Washing Powder 2.6kg', category: 'Household', brand: 'Persil', unit: '2.6kg', image: '/images/products/washing-powder.jpg' },
  { name: 'Toilet Roll x9', category: 'Household', brand: 'Andrex', unit: '9 pack', image: '/images/products/toilet-roll.jpg' },
  { name: 'Shampoo 300ml', category: 'Health & Beauty', brand: 'Head & Shoulders', unit: '300ml', image: '/images/products/shampoo.jpg' }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    await Product.deleteMany({});
    await Store.deleteMany({});
    await Price.deleteMany({});
    console.log('Cleared existing data');
    
    const createdStores = await Store.insertMany(stores);
    console.log(`Created ${createdStores.length} stores`);
    
    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);
    
    const prices = [];
    for (const product of createdProducts) {
      for (const store of createdStores) {
        const basePrice = Math.random() * 10 + 0.5;
        const variation = (Math.random() - 0.5) * 2;
        const price = Math.max(0.5, basePrice + variation).toFixed(2);
        
        const previousPrice = Math.random() > 0.7 ? 
          (parseFloat(price) + Math.random() * 2).toFixed(2) : null;
        
        prices.push({
          product: product._id,
          store: store._id,
          price: parseFloat(price),
          previousPrice: previousPrice ? parseFloat(previousPrice) : null,
          discount: previousPrice ? parseFloat(previousPrice) - parseFloat(price) : 0,
          discountPercentage: previousPrice ? 
            ((parseFloat(previousPrice) - parseFloat(price)) / parseFloat(previousPrice) * 100).toFixed(2) : 0,
          inStock: Math.random() > 0.1,
          url: `${store.website}/product/${product._id}`
        });
      }
    }
    
    const createdPrices = await Price.insertMany(prices);
    console.log(`Created ${createdPrices.length} price entries`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();