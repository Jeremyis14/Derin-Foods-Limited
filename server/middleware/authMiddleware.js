import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Middleware to protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Check if token exists and is not empty
      if (!token || token === 'undefined' || token === 'null') {
        res.status(401);
        throw new Error('Not authorized, invalid token');
      }

      // Log token for debugging (remove in production)
      console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
      console.log('Token length:', token.length);
      console.log('Token preview:', token.substring(0, 20) + '...');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

      // Get user from the token payload
      const userId = decoded?.user?.id || decoded?.id;
      if (!userId) {
        res.status(401);
        throw new Error('Not authorized, invalid token payload');
      }

      req.user = await User.findById(userId).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      console.error('JWT_SECRET length:', process.env.JWT_SECRET?.length || 'Not set');
      res.status(401);
      throw new Error(`Not authorized, token failed: ${error.message}`);
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin };
