import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general API rate limiter to /api
app.use('/api', apiLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(ENV.UPLOAD_DIR));

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

// Production Static Serving for Built Frontend
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
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
