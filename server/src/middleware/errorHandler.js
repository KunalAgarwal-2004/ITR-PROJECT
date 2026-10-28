import { ENV } from '../config/env.js';
import { AppError } from '../utils/appError.js';

/**
 * Centralized Express Error Handling Middleware
 * Converts native Mongoose, JWT, Zod, and operational AppErrors
 * into standardized JSON error envelopes.
 */
export const errorHandler = (err, req, res, next) => {
  let error = err instanceof AppError ? err : new AppError(err.message, err.statusCode || 500);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    error = new AppError(`Resource not found with id: ${err.value}`, 404);
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new AppError(`Duplicate value entered for ${field}. Please use another value.`, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const formattedErrors = Object.values(err.errors || {}).map(val => ({
      field: val.path,
      message: val.message
    }));
    error = new AppError('Database validation failed', 400, formattedErrors);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your session has expired. Please log in again.', 401);
  }

  // Zod Validation Errors
  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    error = new AppError('Request validation failed', 400, formattedErrors);
  }

  // SyntaxError from JSON body parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new AppError('Malformed JSON payload received', 400);
  }

  const statusCode = error.statusCode || 500;
  const isProd = ENV.NODE_ENV === 'production';

  // In production, mask non-operational internal errors
  const message = isProd && !error.isOperational
    ? 'Internal Server Error'
    : error.message || 'An unexpected error occurred';

  const responsePayload = {
    success: false,
    message,
    ...(error.errors && { errors: error.errors }),
    ...(!isProd && { stack: err.stack })
  };

  res.status(statusCode).json(responsePayload);
};

export default errorHandler;
