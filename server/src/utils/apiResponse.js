/**
 * Standardized API Response Utilities
 * Enforces consistent JSON formatting across all API endpoints:
 * {
 *   success: true | false,
 *   message: string,
 *   data?: any,
 *   errors?: any,
 *   meta?: any
 * }
 */

export const successResponse = (
  res,
  { statusCode = 200, message = 'Success', data = null, meta = null } = {}
) => {
  const payload = {
    success: true,
    message
  };

  if (data !== null) {
    payload.data = data;
  }

  if (meta !== null) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const errorResponse = (
  res,
  { statusCode = 500, message = 'An unexpected error occurred', errors = null } = {}
) => {
  const payload = {
    success: false,
    message
  };

  if (errors !== null) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

export default {
  successResponse,
  errorResponse
};
