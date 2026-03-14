import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Real-time visitor counter (SSE)
const visitorClients = new Set();

const broadcastVisitorCount = () => {
  const payload = JSON.stringify({ count: visitorClients.size });
  for (const client of visitorClients) {
    client.write(`data: ${payload}\n\n`);
  }
};

app.get('/api/visitors/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  visitorClients.add(res);
  broadcastVisitorCount();

  req.on('close', () => {
    visitorClients.delete(res);
    broadcastVisitorCount();
  });
});

// DB readiness guard for API routes
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || req.path === '/visitors/stream') {
    return next();
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database not connected',
      message: 'MongoDB is not connected. Please check MONGODB_URI and Atlas IP whitelist.',
    });
  }
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});

export default app;
