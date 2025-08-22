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
  // Dairy & Eggs
  { name: 'Tesco British Semi Skimmed Milk', category: 'Dairy & Eggs', brand: 'Tesco', unit: '2.272L/4 pints', image: '/images/products/milk-semi-skimmed.jpg' },
  { name: 'Cravendale Whole Milk', category: 'Dairy & Eggs', brand: 'Cravendale', unit: '2L', image: '/images/products/milk-cravendale.jpg' },
  { name: 'Tesco British Free Range Large Eggs', category: 'Dairy & Eggs', brand: 'Tesco', unit: '12 pack', image: '/images/products/eggs-free-range.jpg' },
  { name: 'Lurpak Slightly Salted Butter', category: 'Dairy & Eggs', brand: 'Lurpak', unit: '250g', image: '/images/products/butter-lurpak.jpg' },
  { name: 'Cathedral City Mature Cheddar', category: 'Dairy & Eggs', brand: 'Cathedral City', unit: '350g', image: '/images/products/cheese-cathedral.jpg' },
  { name: 'Philadelphia Original Soft Cheese', category: 'Dairy & Eggs', brand: 'Philadelphia', unit: '180g', image: '/images/products/cheese-philadelphia.jpg' },
  { name: 'Muller Corner Strawberry Yogurt', category: 'Dairy & Eggs', brand: 'Muller', unit: '4x124g', image: '/images/products/yogurt-muller.jpg' },
  { name: 'Activia Natural Yogurt', category: 'Dairy & Eggs', brand: 'Activia', unit: '500g', image: '/images/products/yogurt-activia.jpg' },
  
  // Bakery
  { name: 'Warburtons Medium White Bread', category: 'Bakery', brand: 'Warburtons', unit: '800g', image: '/images/products/bread-warburtons.jpg' },
  { name: 'Hovis Soft White Medium Bread', category: 'Bakery', brand: 'Hovis', unit: '800g', image: '/images/products/bread-hovis.jpg' },
  { name: 'Kingsmill 50/50 Medium Bread', category: 'Bakery', brand: 'Kingsmill', unit: '800g', image: '/images/products/bread-kingsmill.jpg' },
  { name: 'Tesco Tiger Bloomer', category: 'Bakery', brand: 'Tesco', unit: '400g', image: '/images/products/bread-tiger.jpg' },
  { name: 'Warburtons Crumpets', category: 'Bakery', brand: 'Warburtons', unit: '6 pack', image: '/images/products/crumpets.jpg' },
  { name: 'McVities Digestive Biscuits', category: 'Bakery', brand: 'McVities', unit: '400g', image: '/images/products/biscuits-digestive.jpg' },
  
  // Meat & Fish
  { name: 'Tesco British Chicken Breast Fillets', category: 'Meat & Fish', brand: 'Tesco', unit: '640g', image: '/images/products/chicken-breast.jpg' },
  { name: 'Tesco British Beef Mince 5% Fat', category: 'Meat & Fish', brand: 'Tesco', unit: '500g', image: '/images/products/beef-mince.jpg' },
  { name: 'Tesco British Pork Sausages', category: 'Meat & Fish', brand: 'Tesco', unit: '454g/8 pack', image: '/images/products/sausages.jpg' },
  { name: 'Richmond Thick Pork Sausages', category: 'Meat & Fish', brand: 'Richmond', unit: '454g/8 pack', image: '/images/products/sausages-richmond.jpg' },
  { name: 'Tesco Smoked Back Bacon', category: 'Meat & Fish', brand: 'Tesco', unit: '300g', image: '/images/products/bacon.jpg' },
  { name: 'Young\'s Battered Fish Fillets', category: 'Meat & Fish', brand: 'Young\'s', unit: '4 pack', image: '/images/products/fish-battered.jpg' },
  { name: 'Tesco Salmon Fillets', category: 'Meat & Fish', brand: 'Tesco', unit: '240g', image: '/images/products/salmon.jpg' },
  
  // Fruit & Vegetables
  { name: 'Tesco Bananas Loose', category: 'Fruit & Vegetables', brand: '', unit: 'per kg', image: '/images/products/bananas.jpg' },
  { name: 'Tesco British Carrots', category: 'Fruit & Vegetables', brand: 'Tesco', unit: '1kg', image: '/images/products/carrots.jpg' },
  { name: 'Tesco Cherry Tomatoes', category: 'Fruit & Vegetables', brand: 'Tesco', unit: '330g', image: '/images/products/tomatoes-cherry.jpg' },
  { name: 'Tesco Iceberg Lettuce', category: 'Fruit & Vegetables', brand: 'Tesco', unit: 'each', image: '/images/products/lettuce.jpg' },
  { name: 'Tesco Red Onions', category: 'Fruit & Vegetables', brand: 'Tesco', unit: '3 pack', image: '/images/products/onions.jpg' },
  { name: 'Tesco British Potatoes', category: 'Fruit & Vegetables', brand: 'Tesco', unit: '2.5kg', image: '/images/products/potatoes.jpg' },
  { name: 'Tesco Broccoli', category: 'Fruit & Vegetables', brand: 'Tesco', unit: '335g', image: '/images/products/broccoli.jpg' },
  { name: 'Tesco Red Peppers', category: 'Fruit & Vegetables', brand: 'Tesco', unit: '3 pack', image: '/images/products/peppers.jpg' },
  { name: 'Tesco Gala Apples', category: 'Fruit & Vegetables', brand: 'Tesco', unit: '6 pack', image: '/images/products/apples.jpg' },
  { name: 'Tesco Seedless Grapes', category: 'Fruit & Vegetables', brand: 'Tesco', unit: '500g', image: '/images/products/grapes.jpg' },
  
  // Food Cupboard
  { name: 'Heinz Baked Beans', category: 'Food Cupboard', brand: 'Heinz', unit: '4x415g', image: '/images/products/beans-heinz.jpg' },
  { name: 'Branston Baked Beans', category: 'Food Cupboard', brand: 'Branston', unit: '4x410g', image: '/images/products/beans-branston.jpg' },
  { name: 'Napolina Chopped Tomatoes', category: 'Food Cupboard', brand: 'Napolina', unit: '4x400g', image: '/images/products/tomatoes-canned.jpg' },
  { name: 'Barilla Spaghetti', category: 'Food Cupboard', brand: 'Barilla', unit: '500g', image: '/images/products/pasta-spaghetti.jpg' },
  { name: 'Dolmio Bolognese Sauce', category: 'Food Cupboard', brand: 'Dolmio', unit: '500g', image: '/images/products/sauce-bolognese.jpg' },
  { name: 'Uncle Ben\'s Long Grain Rice', category: 'Food Cupboard', brand: 'Uncle Ben\'s', unit: '1kg', image: '/images/products/rice.jpg' },
  { name: 'Kellogg\'s Corn Flakes', category: 'Food Cupboard', brand: 'Kellogg\'s', unit: '720g', image: '/images/products/cereal-cornflakes.jpg' },
  { name: 'Weetabix Original', category: 'Food Cupboard', brand: 'Weetabix', unit: '36 pack', image: '/images/products/cereal-weetabix.jpg' },
  { name: 'Walkers Ready Salted Crisps', category: 'Food Cupboard', brand: 'Walkers', unit: '12x25g', image: '/images/products/crisps-walkers.jpg' },
  
  // Frozen
  { name: 'Birds Eye Garden Peas', category: 'Frozen', brand: 'Birds Eye', unit: '800g', image: '/images/products/peas-frozen.jpg' },
  { name: 'McCain Home Chips', category: 'Frozen', brand: 'McCain', unit: '900g', image: '/images/products/chips-mccain.jpg' },
  { name: 'Ben & Jerry\'s Cookie Dough Ice Cream', category: 'Frozen', brand: 'Ben & Jerry\'s', unit: '465ml', image: '/images/products/ice-cream-benjerrys.jpg' },
  { name: 'Chicago Town Deep Dish Pepperoni Pizza', category: 'Frozen', brand: 'Chicago Town', unit: '2x155g', image: '/images/products/pizza-chicago.jpg' },
  { name: 'Tesco Frozen Mixed Vegetables', category: 'Frozen', brand: 'Tesco', unit: '1kg', image: '/images/products/vegetables-mixed.jpg' },
  { name: 'Magnum Classic Ice Cream', category: 'Frozen', brand: 'Magnum', unit: '4x110ml', image: '/images/products/ice-cream-magnum.jpg' },
  
  // Drinks
  { name: 'Coca-Cola Original', category: 'Drinks', brand: 'Coca-Cola', unit: '1.5L', image: '/images/products/coke.jpg' },
  { name: 'Pepsi Max', category: 'Drinks', brand: 'Pepsi', unit: '1.5L', image: '/images/products/pepsi.jpg' },
  { name: 'Tropicana Orange Juice', category: 'Drinks', brand: 'Tropicana', unit: '1.4L', image: '/images/products/juice-orange.jpg' },
  { name: 'Innocent Apple Juice', category: 'Drinks', brand: 'Innocent', unit: '1.35L', image: '/images/products/juice-apple.jpg' },
  { name: 'PG Tips Original Tea Bags', category: 'Drinks', brand: 'PG Tips', unit: '240 bags', image: '/images/products/tea-pgtips.jpg' },
  { name: 'Yorkshire Tea Bags', category: 'Drinks', brand: 'Yorkshire Tea', unit: '240 bags', image: '/images/products/tea-yorkshire.jpg' },
  { name: 'Nescafe Gold Blend Instant Coffee', category: 'Drinks', brand: 'Nescafe', unit: '200g', image: '/images/products/coffee-nescafe.jpg' },
  { name: 'Kenco Smooth Instant Coffee', category: 'Drinks', brand: 'Kenco', unit: '200g', image: '/images/products/coffee-kenco.jpg' },
  { name: 'Evian Natural Mineral Water', category: 'Drinks', brand: 'Evian', unit: '6x1.5L', image: '/images/products/water-evian.jpg' },
  { name: 'Robinsons Orange Squash', category: 'Drinks', brand: 'Robinsons', unit: '1L', image: '/images/products/squash-robinsons.jpg' },
  
  // Household
  { name: 'Andrex Classic Clean Toilet Tissue', category: 'Household', brand: 'Andrex', unit: '9 rolls', image: '/images/products/toilet-paper-andrex.jpg' },
  { name: 'Fairy Original Washing Up Liquid', category: 'Household', brand: 'Fairy', unit: '870ml', image: '/images/products/washing-liquid.jpg' },
  { name: 'Persil Non Bio Washing Powder', category: 'Household', brand: 'Persil', unit: '2.6kg/40 washes', image: '/images/products/washing-powder-persil.jpg' },
  { name: 'Ariel All-in-1 Pods', category: 'Household', brand: 'Ariel', unit: '38 washes', image: '/images/products/washing-pods-ariel.jpg' },
  { name: 'Comfort Pure Fabric Conditioner', category: 'Household', brand: 'Comfort', unit: '3L/85 washes', image: '/images/products/fabric-conditioner.jpg' },
  { name: 'Flash All Purpose Cleaner', category: 'Household', brand: 'Flash', unit: '1L', image: '/images/products/cleaner-flash.jpg' },
  
  // Health & Beauty
  { name: 'Colgate Total Original Toothpaste', category: 'Health & Beauty', brand: 'Colgate', unit: '125ml', image: '/images/products/toothpaste-colgate.jpg' },
  { name: 'Head & Shoulders Classic Clean Shampoo', category: 'Health & Beauty', brand: 'Head & Shoulders', unit: '500ml', image: '/images/products/shampoo-headshoulders.jpg' },
  { name: 'Dove Original Roll-On Deodorant', category: 'Health & Beauty', brand: 'Dove', unit: '50ml', image: '/images/products/deodorant-dove.jpg' },
  { name: 'Gillette Blue II Disposable Razors', category: 'Health & Beauty', brand: 'Gillette', unit: '10 pack', image: '/images/products/razors-gillette.jpg' }
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
        // Generate realistic price variations between stores
        let basePrice;
        
        // Set base prices based on product type
        if (product.name.includes('Milk')) basePrice = 1.65;
        else if (product.name.includes('Bread')) basePrice = 1.20;
        else if (product.name.includes('Eggs')) basePrice = 2.50;
        else if (product.name.includes('Chicken Breast')) basePrice = 5.50;
        else if (product.name.includes('Beef Mince')) basePrice = 4.00;
        else if (product.name.includes('Butter')) basePrice = 2.00;
        else if (product.name.includes('Cheese')) basePrice = 3.50;
        else if (product.name.includes('Bananas')) basePrice = 0.85;
        else if (product.name.includes('Coffee')) basePrice = 5.00;
        else if (product.name.includes('Tea')) basePrice = 4.00;
        else if (product.name.includes('Ice Cream')) basePrice = 4.50;
        else if (product.name.includes('Pizza')) basePrice = 3.50;
        else if (product.name.includes('Washing')) basePrice = 8.00;
        else if (product.name.includes('Toilet')) basePrice = 5.50;
        else if (product.name.includes('Shampoo')) basePrice = 3.00;
        else basePrice = Math.random() * 5 + 1;
        
        // Add store-specific variations
        let storeMultiplier = 1;
        if (store.name === 'Waitrose') storeMultiplier = 1.15; // Waitrose typically more expensive
        else if (store.name === 'ASDA') storeMultiplier = 0.95; // ASDA typically cheaper
        else if (store.name === 'Iceland') storeMultiplier = 0.92; // Iceland competitive pricing
        else if (store.name === 'Tesco') storeMultiplier = 1.0;
        else if (store.name === 'Sainsburys') storeMultiplier = 1.05;
        else if (store.name === 'Morrisons') storeMultiplier = 0.98;
        
        const variation = (Math.random() - 0.5) * 0.3; // ±15% random variation
        const price = Math.max(0.5, basePrice * storeMultiplier + variation).toFixed(2);
        
        // Randomly add some discounts
        const hasDiscount = Math.random() > 0.8;
        const previousPrice = hasDiscount ? 
          (parseFloat(price) * (1 + Math.random() * 0.3)).toFixed(2) : null;
        
        prices.push({
          product: product._id,
          store: store._id,
          price: parseFloat(price),
          previousPrice: previousPrice ? parseFloat(previousPrice) : null,
          discount: previousPrice ? parseFloat(previousPrice) - parseFloat(price) : 0,
          discountPercentage: previousPrice ? 
            ((parseFloat(previousPrice) - parseFloat(price)) / parseFloat(previousPrice) * 100).toFixed(2) : 0,
          inStock: Math.random() > 0.05, // 95% chance of being in stock
          url: `${store.website}/product/${product._id}`
        });
      }
    }
    
    const createdPrices = await Price.insertMany(prices);
    console.log(`Created ${createdPrices.length} price entries`);
    
    console.log('Database seeded with real UK grocery products!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();