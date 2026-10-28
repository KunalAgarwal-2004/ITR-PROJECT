import mongoose from 'mongoose';

/**
 * Middleware to check MongoDB connection readiness.
 * Prevents database queries from hanging or crashing when database is disconnected.
 */
export const requireDB = (req, res, next) => {
  // readyState: 1 = connected, 2 = connecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database service is currently unavailable. Please verify MongoDB connection and network access.',
      error: 'DATABASE_DISCONNECTED',
      data: null
    });
  }
  next();
};

export default requireDB;
