import { Request, Response } from 'express';
import { CommunityReport } from '../types';

// In-memory reports store (can be connected to MongoDB in Phase 4)
const reportsDatabase: CommunityReport[] = [];

export async function handleReportJob(req: Request, res: Response): Promise<void> {
  try {
    const report: CommunityReport = req.body;

    if (!report || !report.jobUrl || !report.reasons || report.reasons.length === 0) {
      res.status(400).json({ success: false, error: 'Invalid report data.' });
      return;
    }

    report.reportedAt = Date.now();
    reportsDatabase.push(report);

    console.log(`[JobGuard Community] New report logged for "${report.jobTitle}" at ${report.companyName}`);

    res.json({
      success: true,
      message: 'Report recorded anonymously. Thank you for protecting the job seeker community.'
    });
  } catch (error) {
    console.error('[JobGuard] Error logging report:', error);
    res.status(500).json({ success: false, error: 'Failed to record report.' });
  }
}

export async function handleGetJobReports(req: Request, res: Response): Promise<void> {
  const jobUrl = req.query.jobUrl as string;
  if (!jobUrl) {
    res.json({ success: true, count: 0 });
    return;
  }

  const matching = reportsDatabase.filter(r => r.jobUrl === jobUrl);
  res.json({ success: true, count: matching.length });
}
