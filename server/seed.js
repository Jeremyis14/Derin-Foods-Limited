import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';

dotenv.config();

const products = [
  {
    name: 'Chicken Burger',
    description: 'Juicy grilled chicken patty with fresh vegetables and special sauce',
    price: 12.99,
    category: 'Food',
    stock: 50,
    image: '/uploads/burger.jpg',
    weight: 350, // in grams
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan cheese',
    price: 9.99,
    category: 'Food',
    stock: 30,
    image: '/uploads/salad.jpg',
    weight: 300,
  },
  {
    name: 'Iced Coffee',
    description: 'Chilled coffee with milk and ice, perfect for hot days',
    price: 4.99,
    category: 'Beverages',
    stock: 100,
    image: '/uploads/coffee.jpg',
    weight: 400,
  },
  {
    name: 'Chocolate Brownie',
    description: 'Rich chocolate brownie with a soft center and chocolate chips',
    price: 6.99,
    category: 'Desserts',
    stock: 40,
    image: '/uploads/brownie.jpg',
    weight: 150,
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries served with ketchup',
    price: 3.99,
    category: 'Snacks',
    stock: 80,
    image: '/uploads/fries.jpg',
    weight: 200,
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Add new products
    await Product.insertMany(products);
    console.log('Database seeded successfully');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the seeder
seedDatabase();
