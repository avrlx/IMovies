import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function createToken(user) {
  if (!env.jwtSecret) {
    const error = new Error('JWT_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }
  return jwt.sign({ userId: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function toPublicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt };
}
