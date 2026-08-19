import { Request, Response } from 'express';
import { JobMetadata, AnalysisResult, RiskLevel } from '../types';
import { runRuleEngine } from '../services/ruleEngine';
import { analyzeJobWithGemini } from '../services/geminiService';

export async function handleAnalyzeJob(req: Request, res: Response): Promise<void> {
  try {
    const job: JobMetadata = req.body.job;

    if (!job || !job.title || !job.description) {
      res.status(400).json({ success: false, error: 'Invalid job data provided.' });
      return;
    }

    // 1. Run deterministic rule engine
    const { score: ruleScore, signals: ruleSignals, healthCheck } = runRuleEngine(job);

    // 2. Run Gemini AI reasoning layer
    const aiOutput = await analyzeJobWithGemini(job);

    // 3. Merge signals and finalize score
    const combinedSignals = [...ruleSignals, ...aiOutput.additionalSignals];
    let totalScore = ruleScore;
    for (const addSignal of aiOutput.additionalSignals) {
      totalScore += (addSignal.impactScore || 0);
    }
    const finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

    let riskLevel: RiskLevel = 'LOW';
    if (finalScore >= 76) riskLevel = 'CRITICAL';
    else if (finalScore >= 51) riskLevel = 'HIGH';
    else if (finalScore >= 26) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    const analysis: AnalysisResult = {
      riskScore: finalScore,
      riskLevel,
      summary: aiOutput.summary || 'Job posting analyzed successfully.',
      signals: combinedSignals,
      healthCheck,
      aiGuidance: aiOutput.aiGuidance,
      analyzedAt: Date.now(),
      job,
      communityReportsCount: 0
    };

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('[JobGuard] Error in handleAnalyzeJob:', error);
    res.status(500).json({ success: false, error: 'Internal server error analyzing job.' });
  }
}
