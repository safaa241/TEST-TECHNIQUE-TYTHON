import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const aliasEmails = [normalizedEmail];

  if (normalizedEmail === 'staff@clinicflow.test') {
    aliasEmails.push('stuff@clinicflow.test');
  } else if (normalizedEmail === 'stuff@clinicflow.test') {
    aliasEmails.push('staff@clinicflow.test');
  }

  const result = await pool.query(
    `SELECT id, email, password, role, full_name AS "fullName", created_at AS "createdAt" 
     FROM users WHERE LOWER(email) = $1 OR LOWER(email) = $2`,
    [aliasEmails[0], aliasEmails[1] || aliasEmails[0]]
  );

  if (result.rows.length === 0) {
    throw new AppError(401, 'Invalid email or password');
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '8h' }
  );

  const { password: _password, ...publicUser } = user;

  return {
    token,
    user: publicUser,
  };
};

export const getCurrentUser = async (userId) => {
  const result = await pool.query(
    `SELECT id, email, role, full_name AS "fullName", created_at AS "createdAt" 
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'User not found');
  }

  return result.rows[0];
};
