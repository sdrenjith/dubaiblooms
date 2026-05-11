import mongoose from 'mongoose';
import { env } from './env.js';

const MAX_CONNECT_ATTEMPTS = 12;
const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDB(): Promise<void> {
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10_000,
      });
      console.log('MongoDB connected successfully');
      return;
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connection attempt ${attempt}/${MAX_CONNECT_ATTEMPTS} failed:`, error);
      if (attempt === MAX_CONNECT_ATTEMPTS) {
        break;
      }
      const backoff = Math.min(INITIAL_RETRY_MS * 2 ** (attempt - 1), MAX_RETRY_MS);
      console.log(`Retrying MongoDB connection in ${backoff}ms…`);
      await sleep(backoff);
    }
  }

  console.error('MongoDB connection failed after all retries:', lastError);
  process.exit(1);
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }
  await mongoose.disconnect();
  console.log('MongoDB connection closed');
}
