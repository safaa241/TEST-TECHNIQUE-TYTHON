import { AppError } from '../utils/AppError.js';

export const notFoundHandler = (req, res, next) => {
  next(new AppError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode >= 500 ? 'Internal server error' : err.message;

  const payload = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV !== 'production' && err.details) {
    payload.details = err.details;
  }

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    payload.message = 'Internal server error';
  }

  return res.status(statusCode).json(payload);
};
