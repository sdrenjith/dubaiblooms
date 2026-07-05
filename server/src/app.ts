import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env, getCorsOrigins, getPublicBaseUrl } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import { createSpaFallback } from './middleware/spaFallback.js';
import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { generateSitemap } from './utils/generateSitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = env.PORT;

app.set('trust proxy', 1);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

/** Production: comma-separated `CORS_ORIGIN`. Dev: localhost + optional configured origin. */
const corsOrigin =
  env.NODE_ENV === 'production'
    ? (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
        const allowed = new Set(getCorsOrigins());
        if (!origin) {
          cb(null, true);
          return;
        }
        cb(null, allowed.has(origin));
      }
    : (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) {
          cb(null, true);
          return;
        }
        const configured = getCorsOrigins();
        if (configured.length > 0 && configured.includes(origin)) {
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

const apiRateLimitMax = env.API_RATE_LIMIT_MAX ?? 3000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: apiRateLimitMax,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV !== 'production',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static files - serve uploaded images
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

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
    const baseUrl = getPublicBaseUrl().replace(/\/$/, '');
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

// SPA fallback: serve index.html with 200 or 404 based on route validity (nginx @spa)
const frontendIndexHtml = path.resolve(__dirname, '..', '..', 'frontend', 'dist', 'index.html');
app.get('*', createSpaFallback(frontendIndexHtml));

// Error handler
app.use(errorHandler);

function registerGracefulShutdown(server: ReturnType<typeof app.listen>): void {
  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down gracefully…`);
    server.close(async (err) => {
      if (err) {
        console.error('Error closing HTTP server:', err);
        process.exit(1);
      }
      try {
        await disconnectDB();
      } catch (e) {
        console.error('Error during MongoDB disconnect:', e);
        process.exit(1);
      }
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Sitemap at http://localhost:${PORT}/sitemap.xml\n`);
  });

  registerGracefulShutdown(server);
};

start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
