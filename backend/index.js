import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';

async function startServer() {
  try {
    await connectDatabase();
    app.listen(env.port, () => console.log(`IMovies API listening on port ${env.port}`));
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exitCode = 1;
  }
}

startServer();
