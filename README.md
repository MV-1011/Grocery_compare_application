# 🛒 UK Grocery Price Comparison App

A modern, real-time web application that helps UK shoppers save money by comparing grocery prices across major supermarket chains. Built with the MERN stack and featuring live price updates, comprehensive product catalogs, and deal discovery.

![UK Grocery Price Comparison](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)

## ✨ Features

- **🔍 Real-time Price Comparison** - Compare prices across Tesco, Sainsbury's, ASDA, Morrisons, Waitrose, and Iceland
- **📱 Product Search & Browse** - Search by name or browse through organized categories 
- **📊 Price History Tracking** - Interactive charts showing price trends over time
- **💰 Best Deals Discovery** - Find current discounts and special offers with customizable filters
- **🔔 Live Updates** - Real-time price notifications via WebSocket connections
- **📷 Product Images** - High-quality product photos for easy identification
- **🎯 Smart Filtering** - Filter by category, brand, discount percentage, and price range
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🏪 Store Profiles** - Detailed information about each participating retailer

## 🛠️ Tech Stack

**Frontend:**
- React 19 with Material-UI for modern, responsive design
- Recharts for interactive price history visualization
- Socket.io-client for real-time updates
- React Router for seamless navigation

**Backend:**
- Node.js & Express.js REST API
- Socket.io for WebSocket real-time communication
- MongoDB with Mongoose for data persistence
- Node-cron for scheduled price updates

**Additional Tools:**
- Cheerio & Axios for web scraping capabilities
- JWT for authentication (ready for user accounts)
- CORS for cross-origin requests

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/uk-grocery-price-comparison.git
cd uk-grocery-price-comparison
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables**
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/uk-grocery-prices
PORT=5005
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

For MongoDB Atlas, update the MONGODB_URI:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/uk-grocery-prices
```

5. **Start MongoDB**
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas and update the MONGODB_URI in .env
```

6. **Seed the Database**
```bash
cd backend
node seed-real-products.js
```

7. **Start the Backend Server**
```bash
cd backend
npm start
```

8. **Start the Frontend Development Server**
In a new terminal:
```bash
cd frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:5005

## 📁 Project Structure

```
uk-grocery-price-comparison/
├── backend/
│   ├── models/              # MongoDB schemas
│   │   ├── Product.js       # Product data model
│   │   ├── Store.js         # Store information model
│   │   └── Price.js         # Price tracking model
│   ├── routes/              # API endpoints
│   │   ├── products.js      # Product CRUD operations
│   │   ├── stores.js        # Store management
│   │   ├── prices.js        # Price comparison logic
│   │   └── scraper.js       # Web scraping endpoints
│   ├── public/images/       # Product images (66 high-quality photos)
│   ├── utils/               # Utility functions
│   │   └── realTimeScraper.js # Real-time scraping logic
│   ├── middleware/          # Express middleware
│   ├── server.js            # Express server setup
│   ├── seed.js              # Database seeding script
│   └── seed-real-products.js # Real UK products seeding
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Navbar.js    # Navigation component
│   │   │   └── RealTimeControls.js # Real-time update controls
│   │   ├── pages/           # Main application pages
│   │   │   ├── HomePage.js       # Landing page with featured products
│   │   │   ├── SearchResults.js  # Product search and filtering
│   │   │   ├── ProductComparison.js # Price comparison view
│   │   │   └── DealsPage.js      # Current deals and discounts
│   │   ├── services/        # API and WebSocket services
│   │   │   ├── api.js       # Axios API configurations
│   │   │   └── socket.js    # Socket.io client setup
│   │   ├── utils/           # Helper functions
│   │   ├── App.js           # Main app component
│   │   └── index.js         # React app entry point
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

## 🎯 API Endpoints

### Products
- `GET /api/products` - Get all products with pagination & filtering
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/categories/list` - Get all categories
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

### Prices
- `GET /api/prices/compare/:productId` - Compare prices for a product
- `GET /api/prices/history/:productId/:storeId` - Get price history
- `GET /api/prices/deals` - Get current deals
- `POST /api/prices` - Update price

### Scraper
- `POST /api/scraper/scrape-product` - Scrape product prices
- `POST /api/scraper/update-all-prices` - Update all prices

## 🔄 WebSocket Events

- `priceUpdate` - Emitted when a single price is updated
- `bulkPriceUpdate` - Emitted when multiple prices are updated
- `scheduledUpdateComplete` - Emitted after scheduled price updates

## 📊 Database Schema

### Product Model
```javascript
{
  name: String,        // Product name
  category: String,    // Product category
  brand: String,       // Brand name
  unit: String,        // Unit measurement
  image: String,       // Image path
  description: String  // Product description
}
```

### Store Model
```javascript
{
  name: String,        // Store name
  website: String,     // Store website URL
  logo: String,        // Logo filename
  isActive: Boolean    // Store status
}
```

### Price Model
```javascript
{
  product: ObjectId,      // Reference to Product
  store: ObjectId,        // Reference to Store
  price: Number,          // Current price
  previousPrice: Number,  // Previous price
  discount: Number,       // Discount amount
  discountPercentage: Number, // Discount percentage
  inStock: Boolean,       // Stock status
  url: String            // Product URL at store
}
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend:
```bash
cd frontend && npm run build
```

2. Deploy the `build` folder to your preferred platform

### Backend Deployment (Heroku/Railway)
1. Set environment variables on your platform
2. Deploy the `backend` folder
3. Run the seeding script: `node seed-real-products.js`

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Update the `MONGODB_URI` in your environment variables
3. Whitelist your deployment IP addresses

## 🛡️ Data & Privacy

- **Demo Data**: Uses sample/mock data for demonstration purposes
- **Compliance**: Respects robots.txt and terms of service in production implementations
- **Privacy**: No personal data collection without explicit user consent
- **Security**: Environment variables for sensitive data, prepared for JWT authentication

## 🔧 Development

### Running Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests (if implemented)
cd backend && npm test
```

### Code Formatting
The project uses standard JavaScript formatting. Consider adding ESLint and Prettier for consistent code style.

### Environment Setup
- **Development**: Uses `NODE_ENV=development`
- **Production**: Set `NODE_ENV=production` for optimizations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup
1. Follow the installation instructions above
2. Make your changes
3. Test thoroughly
4. Submit a pull request with a clear description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Product Images**: Sourced from Unsplash contributors
- **UI Framework**: Material-UI for beautiful, accessible components
- **Inspiration**: The need for transparent grocery pricing in the UK market
- **Community**: Built with modern web technologies for optimal performance

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/uk-grocery-price-comparison/issues) page
2. Create a new issue if your problem isn't already addressed
3. Provide detailed information about your environment and the issue

---

**💰 Save money on your weekly shop - start comparing prices today!** 🛒

Made with ❤️ for UK shoppers