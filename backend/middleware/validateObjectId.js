/**
 * ObjectId validation middleware
 * 
 * What this file does:
 * - Validates MongoDB ObjectId format in route parameters
 * - Returns 400 error if ID format is invalid
 * 
 * Frontend usage:
 * - Used by all routes with :id parameter
 * - Prevents invalid ID format errors before database queries
 */
import mongoose from 'mongoose';

export const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      message: 'Invalid ID format' 
    });
  }
  
  next();
};

