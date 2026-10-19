import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticate(request, response, next) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return response.status(401).json({ success: false, message: 'Authentication token is required' });
  if (!env.jwtSecret) return response.status(500).json({ success: false, message: 'JWT_SECRET is not configured' });
  try {
    request.user = jwt.verify(header.slice(7), env.jwtSecret);
    return next();
  } catch (_error) {
    return response.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
