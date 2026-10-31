
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { authRoutes } from './routes/authRoutes.js';
import { employeeRoutes } from './routes/employeeRoutes.js';
import { customerRoutes } from './routes/customerRoutes.js';
import { accountRoutes } from './routes/accountRoutes.js';
import { transactionRoutes } from './routes/transactionRoutes.js';
import { fdRoutes } from './routes/fdRoutes.js';
import { rdRoutes } from './routes/rdRoutes.js';
import { loanRoutes } from './routes/loanRoutes.js';
import { reportRoutes } from './routes/reportRoutes.js';
import { auditRoutes } from './routes/auditRoutes.js';
import { riskRoutes } from './routes/riskRoutes.js';
import { notificationRoutes } from './routes/notificationRoutes.js';
import { managerRoutes } from './routes/managerRoutes.js';
import { recordingRoutes } from './routes/recordingRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { dashboardRoutes } from './routes/dashboardRoutes.js';
import { securityRoutes } from './routes/securityRoutes.js';

import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';

export const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, '../client/dist');

// IMPORTANT:
// Render runs Express behind a reverse proxy.
// Configure this BEFORE rate limiting and route middleware.
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.CLIENT_URLS,
  credentials: true
}));

// Request body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('dev'));

// API rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'banking-portal-api',
    time: new Date().toISOString()
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Employee and customer routes
app.use('/api/employees', employeeRoutes);
app.use('/api/customers', customerRoutes);

// Banking operations
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fds', fdRoutes);
app.use('/api/rds', rdRoutes);
app.use('/api/loans', loanRoutes);

// Reports and audit
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);

// Risk and security
app.use('/api/risk', riskRoutes);
app.use('/api/security', securityRoutes);

// Notifications and management
app.use('/api/notifications', notificationRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve frontend production build
app.use(express.static(clientDistPath));

// React/Vite SPA fallback
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(
    path.join(clientDistPath, 'index.html'),
    (error) => {
      if (error) {
        next(error);
      }
    }
  );
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
