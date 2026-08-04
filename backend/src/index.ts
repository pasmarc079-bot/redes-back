// @ts-expect-error BigInt JSON serialization
BigInt.prototype.toJSON = function () { return Number(this); };

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import blogRoutes from './routes/blog.routes';
import { publicRouter as badgePublicRoutes, adminRouter as badgeAdminRoutes } from './routes/badge.routes';
import memberRoutes from './routes/member.routes';
import mediaRoutes from './routes/media.routes';
import socialRoutes from './routes/social.routes';
import siteRoutes from './routes/site.routes';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/posts', blogRoutes);
app.use('/api/v1/badges', badgePublicRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/admin/media', mediaRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/site', siteRoutes);

// Admin routes (protected)
app.use('/api/v1/admin/events', eventRoutes);
app.use('/api/v1/admin/posts', blogRoutes);
app.use('/api/v1/admin/badges', badgeAdminRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📚 Health: http://0.0.0.0:${PORT}/health`);
});

export default app;
