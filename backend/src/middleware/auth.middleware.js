import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import pool from '../config/db.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Unauthorized: missing or invalid token');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    const result = await pool.query(
      'SELECT id, email, role, full_name AS "fullName", created_at AS "createdAt" FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      throw new AppError(401, 'Unauthorized: user not found');
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Unauthorized: token expired'));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError(401, 'Unauthorized: invalid token'));
    }

    next(error);
  }
};
