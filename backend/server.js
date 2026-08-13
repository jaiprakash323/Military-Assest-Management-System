import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import prisma from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, '../frontend/dist');

// Route imports
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import expenditureRoutes from './routes/expenditureRoutes.js';


const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all origins for dev flexibility
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Root & Health Check Routes ──────────────────────────────────
app.get('/', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).json({
    message: 'Welcome to Military Asset Management API',
    status: 'operational',
    healthCheck: '/api/health',
    endpoints: {
      auth: '/api/auth',
      assets: '/api/assets',
      purchases: '/api/purchases',
      transfers: '/api/transfers',
      assignments: '/api/assignments',
      expenditures: '/api/expenditures',
    },
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Military Asset Management API Root',
    status: 'operational',
    healthCheck: '/api/health',
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'operational',
      database: 'connected',
      service: 'Military Asset Management API',
      timestamp: new Date().toISOString(),
    });
  } catch (dbError) {
    console.error('Health Check DB Connection Error:', dbError);
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      error: dbError.message,
      service: 'Military Asset Management API',
      timestamp: new Date().toISOString(),
    });
  }
});



// ─── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/expenditures', expenditureRoutes);

// ─── Static Frontend (Production) ────────────────────────────────
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.warn(`⚠️ Warning: Static frontend build not found at ${frontendDistPath}`);
}

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Server Start ───────────────────────────────────────────────
const startServer = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ WARNING: DATABASE_URL environment variable is not defined!');
    }
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Military Asset API running on port ${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    if (error.code === 'P1001') {
      console.error('\n📌 Render / PostgreSQL Troubleshooting:');
      console.error(' 1. Ensure `DATABASE_URL` environment variable is set in your Render Web Service Environment variables.');
      console.error(' 2. Verify your Render PostgreSQL database service is created and running.');
      console.error(' 3. If using an external database, append `?sslmode=require` to `DATABASE_URL` if SSL is required.\n');
    }
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
