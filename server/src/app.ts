import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { generateSitemap } from './utils/generateSitemap.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

/** Allow any localhost Vite port in dev so /api calls work when CLIENT_URL is set to one port but dev runs on another (e.g. 5176). */
const corsOrigin =
  process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL || true
    : (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) {
          cb(null, true);
          return;
        }
        const configured = process.env.CLIENT_URL?.trim();
        if (configured && origin === configured) {
          cb(null, true);
          return;
        }
        if (/^https?:\/\/localhost(:\d+)?$/i.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin)) {
          cb(null, true);
          return;
        }
        cb(null, false);
      };

app.use(cors({ origin: corsOrigin, credentials: true }));

// Rate limiting — 200/15min was too low: one public page can issue several reads (layout + page).
const apiRateLimitMax = Number(process.env.API_RATE_LIMIT_MAX);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number.isFinite(apiRateLimitMax) && apiRateLimitMax > 0 ? apiRateLimitMax : 3000,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== 'production',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static files - serve uploaded images
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Ensure uploads directory exists
import fs from 'fs';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

// Sitemap.xml
app.get('/sitemap.xml', async (_req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const sitemap = await generateSitemap(baseUrl);
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🗺️  Sitemap at http://localhost:${PORT}/sitemap.xml\n`);
  });
};

start();
