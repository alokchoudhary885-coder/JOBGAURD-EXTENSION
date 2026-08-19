import { GoogleGenerativeAI } from '@google/generative-ai';
import { JobMetadata, RiskSignal } from '../types';

export interface GeminiAnalysisOutput {
  aiGuidance: string;
  summary: string;
  additionalSignals: RiskSignal[];
}

export async function analyzeJobWithGemini(job: JobMetadata): Promise<GeminiAnalysisOutput> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    // Intelligent heuristic fallback when API key is not configured
    return generateFallbackAiInsights(job);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are JobGuard AI, an elite cybersecurity and employment fraud analysis engine.
Analyze the following job posting for suspicious scam patterns, phishing indicators, upfront fee requests, or legitimacy markers.

Job Information:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'Not specified'}
Salary: ${job.salary || 'Not specified'}
Recruiter Email: ${job.recruiterEmail || 'Not specified'}
URL: ${job.jobUrl}
Description: ${job.description.slice(0, 3000)}

Return a strict JSON object with this exact schema:
{
  "summary": "1-2 sentence neutral summary of the posting risk assessment",
  "aiGuidance": "1-2 sentence actionable advice for the job seeker",
  "additionalSignals": [
    {
      "id": "unique_string",
      "type": "payment|email|domain|salary|off_platform|urgency",
      "category": "warning|critical|positive",
      "title": "Short title",
      "description": "Why this signal matters",
      "evidence": "Quoted text from JD if available",
      "impactScore": 15
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean JSON response (remove markdown code fences if present)
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      summary: parsed.summary || 'JobGuard AI analysis complete.',
      aiGuidance: parsed.aiGuidance || 'Verify the opening on the official company careers portal before proceeding.',
      additionalSignals: Array.isArray(parsed.additionalSignals) ? parsed.additionalSignals : []
    };
  } catch (error) {
    console.error('[JobGuard Backend] Gemini API analysis error, falling back to local reasoning', error);
    return generateFallbackAiInsights(job);
  }
}

function generateFallbackAiInsights(job: JobMetadata): GeminiAnalysisOutput {
  const desc = job.description.toLowerCase();

  let summary = 'Standard hiring patterns detected. No critical anomalies identified.';
  let aiGuidance = 'This job posting aligns well with legitimate employment standards. Standard application procedures are recommended.';

  if (desc.includes('registration fee') || desc.includes('security deposit') || desc.includes('training fee') || desc.includes('pay inr') || desc.includes('pay rs')) {
    summary = 'Critical risk detected! Upfront financial payment or deposit requested.';
    aiGuidance = 'Never send money, crypto, or purchase gift cards for any job offer. Legitimate companies never charge candidates.';
  } else if (desc.includes('whatsapp') || desc.includes('telegram') || desc.includes('wa.me')) {
    summary = 'Elevated caution advised: Recruiter directs candidates to off-platform chat channels.';
    aiGuidance = 'Keep all recruitment communications on the official job platform. Ask for an official corporate email confirmation first.';
  } else if (job.recruiterEmail && (job.recruiterEmail.includes('gmail.com') || job.recruiterEmail.includes('yahoo.com'))) {
    summary = 'Notice: Recruiter is utilizing a generic public email address rather than a corporate domain.';
    aiGuidance = 'Cross-reference the company on their official website or LinkedIn corporate page before sharing confidential documents.';
  }

  return {
    summary,
    aiGuidance,
    additionalSignals: []
  };
}
