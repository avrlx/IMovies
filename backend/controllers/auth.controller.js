import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { createToken, toPublicUser } from '../utils/auth.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(name, email, password, requireName = false) {
  if (requireName && (!name || typeof name !== 'string' || !name.trim())) return 'Name is required';
  if (typeof email !== 'string' || !emailPattern.test(email.trim())) return 'A valid email is required';
  if (typeof password !== 'string' || password.length < 6) return 'Password must be at least 6 characters long';
  return null;
}

export async function register(request, response) {
  const { name, email, password, phone } = request.body || {};
  const validationError = validateCredentials(name, email, password, true);
  if (validationError) return response.status(400).json({ success: false, message: validationError });
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.findOne({ email: normalizedEmail }).lean()) return response.status(409).json({ success: false, message: 'Email is already registered' });
  const user = await User.create({ name: name.trim(), email: normalizedEmail, phone, password: await bcrypt.hash(password, 12) });
  return response.status(201).json({ success: true, message: 'Registration successful', token: createToken(user), user: toPublicUser(user) });
}

export async function login(request, response) {
  const { email, password } = request.body || {};
  const validationError = validateCredentials(null, email, password);
  if (validationError) return response.status(400).json({ success: false, message: validationError });
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) return response.status(401).json({ success: false, message: 'Invalid email or password' });
  return response.json({ success: true, message: 'Login successful', token: createToken(user), user: toPublicUser(user) });
}

export async function getCurrentUser(request, response) {
  const user = await User.findById(request.user.userId);
  if (!user) return response.status(404).json({ success: false, message: 'User not found' });
  return response.json({ success: true, user: toPublicUser(user) });
}
