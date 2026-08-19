import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

// Rate limiter: 120 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Mount API Routes
app.use('/api/v1', apiRoutes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: '🛡️ JobGuard Verification Engine API is active.',
    endpoints: {
      health: 'GET /api/v1/health',
      analyze: 'POST /api/v1/analyze',
      reports: 'POST /api/v1/reports'
    }
  });
});

app.listen(PORT, () => {
  console.log(`[JobGuard Backend] 🛡️ Server running on http://localhost:${PORT}`);
  console.log(`[JobGuard Backend] Health check: http://localhost:${PORT}/api/v1/health`);
});
