import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import freelancerRoutes from './routes/freelancerRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import apiV1Router from './routes/api.js';
import { requireDB } from './middleware/dbCheck.js';

const app = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. Global Rate Limiting
app.use(globalLimiter);

// 3. CORS Configuration supporting credentials
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        ENV.CLIENT_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174'
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// 4. Request Logging
if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// 5. Body & Cookie Parsing with Size Limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(ENV.COOKIE_SECRET));

// 6. Direct Root & Health Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'WorkBridge Freelance Marketplace API',
    version: '1.0.0',
    status: 'active',
    healthCheck: '/api/health',
    authEndpoints: '/api/auth',
    freelancersEndpoints: '/api/freelancers',
    jobsEndpoints: '/api/jobs',
    proposalsEndpoints: '/api/proposals',
    projectsEndpoints: '/api/projects',
    versionedApi: '/api/v1'
  });
});

// Health check
app.use('/api/health', healthRoutes);

// Marketplace Core API endpoints
app.use('/api/auth', requireDB, authRoutes);
app.use('/api/freelancers', requireDB, freelancerRoutes);
app.use('/api/jobs', requireDB, jobRoutes);
app.use('/api/proposals', requireDB, proposalRoutes);
app.use('/api/projects', requireDB, projectRoutes);

// 7. Versioned API Routes: /api/v1
app.use('/api/v1', apiV1Router);

// 8. Centralized 404 Route Handler
app.use(notFoundHandler);

// 9. Centralized Error Handler
app.use(errorHandler);

export default app;
