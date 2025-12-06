/**
 * Optional authentication middleware
 * 
 * What this file does:
 * - Attempts to authenticate user if a token is provided
 * - Does NOT fail if no token is present (unlike protect middleware)
 * - Allows endpoints to work for both authenticated and unauthenticated users
 * 
 * Frontend usage:
 * - Used by menu endpoint to show all items to staff/manager, only available to guests
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No token provided - continue without user (guest access)
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    // Token is invalid but we still allow access as guest
    next();
  }
};

