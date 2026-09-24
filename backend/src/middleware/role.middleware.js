import { AppError } from '../utils/AppError.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized: authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden: insufficient permissions'));
    }

    next();
  };
};
