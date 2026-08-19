export type PlatformType = 'linkedin' | 'internshala' | 'indeed' | 'career_portal' | 'other';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface JobMetadata {
  title: string;
  company: string;
  location?: string;
  salary?: string;
  experience?: string;
  description: string;
  recruiterName?: string;
  recruiterEmail?: string;
  companyWebsite?: string;
  jobUrl: string;
  platform: PlatformType;
  extractedAt: number;
}

export type SignalCategory = 'warning' | 'positive' | 'critical';

export interface RiskSignal {
  id: string;
  type: 'email' | 'domain' | 'payment' | 'salary' | 'off_platform' | 'urgency' | 'official_match' | 'community';
  category: SignalCategory;
  title: string;
  description: string;
  evidence?: string;
  impactScore: number; // e.g. +15, +25, -15
}

export interface HealthCheckItem {
  status: 'safe' | 'warning' | 'critical' | 'neutral';
  label: string;
  detail?: string;
}

export interface HealthCheck {
  companyWebsite: HealthCheckItem;
  recruiterEmail: HealthCheckItem;
  salaryRealism: HealthCheckItem;
  communication: HealthCheckItem;
  officialListing: HealthCheckItem;
}

export interface AnalysisResult {
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  summary: string;
  signals: RiskSignal[];
  healthCheck: HealthCheck;
  aiGuidance: string;
  analyzedAt: number;
  job: JobMetadata;
  communityReportsCount: number;
}

export interface CommunityReport {
  jobUrl: string;
  companyName: string;
  jobTitle: string;
  reasons: string[];
  customNote?: string;
  reportedAt: number;
}
