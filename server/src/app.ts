import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import careerRoomsRoutes from './routes/careerRooms.routes';
import materialsRoutes from './routes/materials.routes';
import contactsRoutes from './routes/contacts.routes';
import eventsRoutes from './routes/events.routes';
import bookingsRoutes from './routes/bookings.routes';
import studentConnectRoutes from './routes/studentConnect.routes';
import studentIssuesRoutes from './routes/studentIssues.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';

const app = express();

// Trust Render's reverse proxy for correct client IP detection in rate limiting
app.set('trust proxy', 1);

// 1. Strict Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'ws:', 'wss:', 'https:'],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Locked-down Dynamic CORS Allowlist
const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/[a-zA-Z0-9-]+\.onrender\.com$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin blocked by policy: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// 3. Performance: Payload compression (Gzip / Deflate)
app.use(compression());

// 4. Request Logging
app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 5. Strict Request Body Limits (DoS protection)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 6. General API Rate Limiting on /api
app.use('/api', apiLimiter);

// 7. Protected Static Serving for Uploads (prevents execution of untrusted files)
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    next();
  },
  express.static(ENV.UPLOAD_DIR)
);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: ENV.NODE_ENV,
    timezone: ENV.TIMEZONE,
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/career-rooms', careerRoomsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/student-connect', studentConnectRoutes);
app.use('/api/issues', studentIssuesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Production Static Serving for Built Frontend with Optimal Cache Headers
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(
    express.static(clientDistPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Central error handler
app.use(errorHandler);

export default app;
