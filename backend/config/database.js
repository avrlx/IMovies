import mongoose from 'mongoose';
import { env } from './env.js';
import Movie from '../models/movie.model.js';

export async function connectDatabase() {
  if (!env.mongoUri) throw new Error('MONGODB_URI is not configured');
  await mongoose.connect(env.mongoUri);
  const indexes = await Movie.collection.indexes().catch((error) => {
    if (error.code === 26 || error.codeName === 'NamespaceNotFound') return [];
    throw error;
  });
  const legacyTextIndex = indexes.find((index) => index.key?._fts === 'text' && index.language_override === 'language');
  if (legacyTextIndex) await Movie.collection.dropIndex(legacyTextIndex.name);
  await Movie.createIndexes();
  console.log('Connected to MongoDB');
}

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});
