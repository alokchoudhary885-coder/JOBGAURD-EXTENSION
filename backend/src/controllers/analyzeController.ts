import { Request, Response } from 'express';
import { JobMetadata, RiskSignal } from '../types';
import { analyzeJobLocally } from '../services/ruleEngine';
import { analyzeJobWithGemini } from '../services/geminiService';

export async function handleAnalyzeJob(req: Request, res: Response): Promise<void> {
  try {
    const job: JobMetadata = req.body.job;

    if (!job || !job.title) {
      res.status(400).json({ success: false, error: 'Invalid job data provided.' });
      return;
    }

    // 1. Run deterministic rule engine locally
    const analysis = analyzeJobLocally(job);

    // 2. Add AI guidance
    const aiOutput = await analyzeJobWithGemini(job);
    analysis.aiGuidance = aiOutput.aiGuidance;

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('[JobGuard] Error in handleAnalyzeJob:', error);
    res.status(500).json({ success: false, error: 'Internal server error analyzing job.' });
  }
}

// On-Demand AI Advice Proxy
export async function handleScoreAdvice(req: Request, res: Response): Promise<void> {
  try {
    const { job, score, signals }: { job: JobMetadata; score: number; signals: RiskSignal[] } = req.body;

    if (!job || !job.title) {
      res.status(400).json({ success: false, error: 'Job metadata is required.' });
      return;
    }

    const aiOutput = await analyzeJobWithGemini(job);

    res.json({
      success: true,
      score,
      signalsCount: signals ? signals.length : 0,
      aiGuidance: aiOutput.aiGuidance,
      summary: aiOutput.summary
    });
  } catch (error) {
    console.error('[JobGuard] Error in handleScoreAdvice:', error);
    res.status(500).json({
      success: false,
      aiGuidance: 'Verify the opening on the official company careers portal before proceeding with applications.'
    });
  }
}
