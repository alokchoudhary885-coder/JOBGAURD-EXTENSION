import { Router } from 'express';
import { handleAnalyzeJob, handleScoreAdvice } from '../controllers/analyzeController';
import { handleReportJob, handleGetJobReports } from '../controllers/reportController';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'JobGuard Risk Engine API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Job Analysis
router.post('/analyze', handleAnalyzeJob);

// On-Demand Structured Score AI Advice Proxy
router.post('/score/advice', handleScoreAdvice);

// Community Reports
router.post('/reports', handleReportJob);
router.get('/reports', handleGetJobReports);

export default router;
