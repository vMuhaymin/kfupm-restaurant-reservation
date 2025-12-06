/**
 * Express server entry point
 * 
 * What this file does:
 * - Initializes Express application
 * - Connects to MongoDB database
 * - Configures CORS for frontend communication
 * - Sets up middleware (JSON parsing, static file serving)
 * - Registers all API routes (auth, menu, orders, staff, manager)
 * - Handles errors and 404 responses
 * - Serves static files from /uploads directory for menu images
 * 
 * Frontend usage:
 * - All frontend pages connect to this server
 * - Base URL: http://localhost:55555/api
 * - Static images served at: http://localhost:55555/uploads
 */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import managerRoutes from './routes/managerRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB().catch((error) => {
  console.error('Failed to connect to database:', error.message);
  console.error('Server will continue but database operations will fail');
  // Don't exit - let the server start and handle errors gracefully
});

// Initialize Express
const app = express();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
// CORS configuration, allow all origins for development
app.use(cors({ 
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/manager', managerRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ###################### PORT CONFIGURATION CHANGED ######################
// Changed from default 5000 to 55555 to avoid port conflicts
// Changed host from 0.0.0.0 to localhost to ensure frontend can connect
// ###################### PORT CONFIGURATION CHANGED ######################
// const PORT = process.env.PORT || 55555;
// const HOST = process.env.HOST || 'localhost' ;

// app.listen(PORT, HOST, () => {
//   console.log(`Server running on http://${HOST}:${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
// });

const PORT = process.env.PORT || 55555;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});