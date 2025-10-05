import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync, mkdir } from 'fs';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the project root
const envPath = resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Debug: Log environment variables
console.log('MongoDB URI:', process.env.MONGO_URI ? '***URI is set***' : 'URI is NOT set');
console.log('Environment variables loaded from:', envPath);

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, '..', 'public', 'uploads');

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Handle SPA routing in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '..', 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize server
const startServer = async () => {
  try {
    console.log('1. Starting server initialization...');
    
    // Log environment variables (except sensitive ones)
    console.log('Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGO_URI: process.env.MONGO_URI ? '***MongoDB URI is set***' : 'MongoDB URI is NOT set',
      JWT_SECRET: process.env.JWT_SECRET ? '***JWT Secret is set***' : 'JWT Secret is NOT set'
    });
    
    // Ensure uploads directory exists
    try {
      await ensureUploadsDir();
      console.log('2. Uploads directory verified');
    } catch (err) {
      console.error('Error creating uploads directory:', err);
      throw err;
    }

    // Connect to MongoDB Atlas
    try {
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error('MongoDB connection string is not defined in environment variables');
      }
      
      console.log('3. Attempting to connect to MongoDB...');
      console.log('Connection string:', mongoUri.split('@')[1] ? '***contains credentials***' : mongoUri);
      
      // Enhanced MongoDB connection options (removed deprecated options for Mongoose 8+ and MongoDB Driver 4+)
      const options = {
        serverSelectionTimeoutMS: 30000, // 30 seconds (increased for better connection reliability)
        socketTimeoutMS: 45000, // 45 seconds
        connectTimeoutMS: 30000, // 30 seconds (increased for better connection reliability)
        maxPoolSize: 10, // Maximum number of connections in the connection pool
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true,
        w: 'majority'
      };

      // Set up event listeners for MongoDB connection
      mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB connected successfully');
      });

      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('ℹ️ MongoDB disconnected');
      });

      // Attempt to connect with retry logic
      const maxRetries = 3;
      let retries = 0;
      
      const connectWithRetry = async () => {
        try {
          await mongoose.connect(mongoUri, options);
          console.log('✅ Successfully connected to MongoDB');
        } catch (error) {
          retries++;
          console.error(`❌ MongoDB connection failed (attempt ${retries}/${maxRetries}):`, error.message);
          
          if (retries < maxRetries) {
            console.log(`Retrying connection in 5 seconds...`);
            setTimeout(connectWithRetry, 5000);
          } else {
            console.error('❌ Max connection retries reached. Please check your MongoDB connection.');
            throw error;
          }
        }
      };
      
      await connectWithRetry();
    } catch (err) {
      console.error('MongoDB connection failed:', {
        message: err.message,
        name: err.name,
        code: err.code,
        codeName: err.codeName,
        ...(err.keyPattern && { keyPattern: err.keyPattern }),
        ...(err.keyValue && { keyValue: err.keyValue })
      });
      throw err; // Re-throw to be caught by the outer try-catch
    }

    // Start server with Socket.IO
    console.log('3. Starting HTTP server...');
    const httpServer = createServer(app);

    // Initialize Socket.IO with permissive CORS (adjust origin via env if needed)
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true
      }
    });

    // Expose io to routes
    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('🔌 Client connected:', socket.id);

      socket.on('disconnect', (reason) => {
        console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
      });
    });

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`4. Server running on http://localhost:${PORT}`);
      console.log(`5. API Endpoint: http://localhost:${PORT}/api/products`);
    });

    // Handle server errors
    httpServer.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
