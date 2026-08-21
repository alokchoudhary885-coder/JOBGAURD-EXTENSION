export type PlatformType = 'linkedin' | 'internshala' | 'indeed' | 'career_portal' | 'other';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

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
  isJsonLd?: boolean;
}

export type SignalCategory = 'warning' | 'positive' | 'critical';

export type SignalType =
  | 'payment'
  | 'contact_channel'
  | 'email'
  | 'company_verification'
  | 'domain'
  | 'compensation'
  | 'salary'
  | 'description_quality'
  | 'urgency'
  | 'process'
  | 'positive'
  | 'official_match'
  | 'community';

export interface RiskSignal {
  id: string;
  type: SignalType;
  category: SignalCategory;
  title: string;
  description: string;
  evidence?: string;
  impactScore: number;
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
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: ConfidenceLevel;
  confidenceReason?: string;
  rulesetVersion: string;
  summary: string;
  signals: RiskSignal[];
  healthCheck: HealthCheck;
  aiGuidance?: string;
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
