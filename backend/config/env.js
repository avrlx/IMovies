import 'dotenv/config';

export const env = {
  port: Number.parseInt(process.env.PORT || '8000', 10),
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  tmdbAccessToken: process.env.TMDB_ACCESS_TOKEN,
  tmdbApiKey: process.env.TMDB_API_KEY,
  tmdbRegion: process.env.TMDB_REGION || 'IN',
  tmdbLanguage: process.env.TMDB_LANGUAGE || 'en-US',
};
