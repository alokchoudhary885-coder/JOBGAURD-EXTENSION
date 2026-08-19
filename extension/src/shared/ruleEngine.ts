import { JobMetadata, AnalysisResult, RiskSignal, HealthCheck, RiskLevel } from '../types';

const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com',
  'yopmail.com', 'tempmail.com', 'mail.ru', 'protonmail.com', 'aol.com',
  'icloud.com', 'zoho.com', 'gmx.com'
];

const KNOWN_ATS_DOMAINS = [
  'greenhouse.io', 'lever.co', 'workday.com', 'smartrecruiters.com',
  'ashbyhq.com', 'jobvite.com', 'taleo.net', 'bamboohr.com', 'myworkdayjobs.com'
];

export function analyzeJobLocally(job: JobMetadata): AnalysisResult {
  const signals: RiskSignal[] = [];
  let calculatedScore = 5;

  const fullText = `${job.title} ${job.company} ${job.description} ${job.recruiterEmail || ''} ${job.jobUrl || ''}`.toLowerCase();

  // 1. Recruiter Email Check
  let emailStatus: HealthCheck['recruiterEmail']['status'] = 'neutral';
  let emailLabel = 'Not Disclosed';
  let emailDetail: string | undefined;

  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const detectedEmail = job.recruiterEmail?.toLowerCase() || emailMatch?.[0];

  if (detectedEmail) {
    const domain = detectedEmail.split('@')[1];
    const isFree = FREE_EMAIL_DOMAINS.includes(domain);

    if (isFree) {
      emailStatus = 'warning';
      emailLabel = `@${domain} (Public Domain)`;
      emailDetail = `Recruiter uses free email (${detectedEmail})`;
      calculatedScore += 18;
      signals.push({
        id: 'email_free_domain',
        type: 'email',
        category: 'warning',
        title: 'Recruiter Uses Public Email Provider',
        description: `Legitimate corporations typically recruit through domain emails (@${job.company.replace(/\s+/g, '').toLowerCase() || 'company'}.com) rather than free @${domain} addresses.`,
        evidence: detectedEmail,
        impactScore: 18,
      });
    } else {
      emailStatus = 'safe';
      emailLabel = `@${domain} (Corporate Domain)`;
      emailDetail = `Official domain: ${detectedEmail}`;
      calculatedScore -= 12;
      signals.push({
        id: 'email_corporate_domain',
        type: 'email',
        category: 'positive',
        title: 'Corporate Email Domain Detected',
        description: `The posting specifies an official corporate domain email (@${domain}).`,
        evidence: detectedEmail,
        impactScore: -12,
      });
    }
  }

  // 2. Financial Extortion / Upfront Payment Check
  const paymentKeywords = [
    'registration fee', 'training fee', 'security deposit', 'laptop deposit',
    'pay inr', 'pay rs', 'processing fee', 'refundable deposit', 'pay ₹',
    'bank transfer', 'crypto', 'usdt', 'deposit money', 'exam fee', 'kit fee',
    'advance fee', 'verification charge'
  ];

  let hasPaymentRequest = false;
  let paymentEvidence = '';

  for (const kw of paymentKeywords) {
    if (fullText.includes(kw)) {
      hasPaymentRequest = true;
      paymentEvidence = kw;
      break;
    }
  }

  if (hasPaymentRequest) {
    calculatedScore += 50;
    signals.push({
      id: 'payment_upfront_fee',
      type: 'payment',
      category: 'critical',
      title: 'Upfront Payment or Deposit Mentioned',
      description: 'Legitimate employers never ask candidates to pay registration fees, security deposits, or training costs as a hiring condition.',
      evidence: `Contains mention of "${paymentEvidence}"`,
      impactScore: 50,
    });
  }

  // 3. Off-Platform Redirection Check
  const offPlatformTriggers = [
    { pattern: /wa\.me\/[0-9]+/i, name: 'Direct WhatsApp Link' },
    { pattern: /chat\.whatsapp\.com/i, name: 'WhatsApp Group Invite' },
    { pattern: /t\.me\/[a-zA-Z0-9_]+/i, name: 'Telegram Channel/Bot' },
    { pattern: /forms\.gle\/[a-zA-Z0-9]+/i, name: 'Google Forms Redirect' },
    { pattern: /bit\.ly\/[a-zA-Z0-9]+/i, name: 'Masked Shortlink (bit.ly)' },
    { pattern: /contact.*whatsapp/i, name: 'WhatsApp Recruitment Prompt' },
  ];

  let communicationStatus: HealthCheck['communication']['status'] = 'safe';
  let communicationLabel = 'Standard Portal Application';
  let commEvidence: string | undefined;

  for (const trigger of offPlatformTriggers) {
    const match = fullText.match(trigger.pattern);
    if (match) {
      communicationStatus = 'warning';
      communicationLabel = trigger.name;
      commEvidence = match[0];
      calculatedScore += 25;
      signals.push({
        id: 'off_platform_redirect',
        type: 'off_platform',
        category: 'warning',
        title: `Off-Platform Communication (${trigger.name})`,
        description: 'Scammers frequently attempt to move job seekers off verified platforms onto encrypted chat apps before soliciting funds or sensitive documents.',
        evidence: match[0],
        impactScore: 25,
      });
      break;
    }
  }

  // 4. Unrealistic Salary / Easy Money Traps
  let salaryStatus: HealthCheck['salaryRealism']['status'] = 'safe';
  let salaryLabel = 'Market Realistic / Standard';

  const unrealisticSalaryPatterns = [
    /earn.*(50,?000|1,?00,?000|lakh).*per.*(day|week|month).*no.*skill/i,
    /no.*interview.*direct.*selection/i,
    /earn.*daily.*part.*time.*simple.*typing/i,
    /data.*entry.*50000.*per.*month/i
  ];

  for (const pattern of unrealisticSalaryPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      salaryStatus = 'warning';
      salaryLabel = 'Abnormally High for Experience';
      calculatedScore += 20;
      signals.push({
        id: 'unrealistic_compensation',
        type: 'salary',
        category: 'warning',
        title: 'Unrealistic Compensation / Zero Skill Claim',
        description: 'High compensation paired with promises of "no skills required" or "direct selection without interview" is a classic indicator of bait-and-switch scams.',
        evidence: match[0],
        impactScore: 20,
      });
      break;
    }
  }

  // 5. Official ATS / Career Portal Positive Match
  let websiteStatus: HealthCheck['companyWebsite']['status'] = 'neutral';
  let websiteLabel = 'Standard Platform Listing';

  const isATS = KNOWN_ATS_DOMAINS.some(ats => job.jobUrl.includes(ats));
  if (isATS) {
    websiteStatus = 'safe';
    websiteLabel = 'Verified Enterprise ATS';
    calculatedScore -= 15;
    signals.push({
      id: 'verified_ats_host',
      type: 'domain',
      category: 'positive',
      title: 'Hosted on Enterprise Recruitment Platform',
      description: 'The job posting URL originates from a recognized enterprise applicant tracking system (ATS).',
      evidence: job.jobUrl,
      impactScore: -15,
    });
  }

  // 6. Comprehensive & Detailed Job Description
  if (job.description && job.description.length > 800) {
    calculatedScore -= 8;
    signals.push({
      id: 'comprehensive_description',
      type: 'official_match',
      category: 'positive',
      title: 'Detailed Role Description & Requirements',
      description: 'The posting contains structured requirements, specific responsibilities, and clear role expectations.',
      impactScore: -8,
    });
  }

  // Clamp final score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(calculatedScore)));

  // Risk Level Determination
  let riskLevel: RiskLevel = 'LOW';
  if (finalScore >= 76) riskLevel = 'CRITICAL';
  else if (finalScore >= 51) riskLevel = 'HIGH';
  else if (finalScore >= 26) riskLevel = 'MEDIUM';
  else riskLevel = 'LOW';

  // Summary generation
  let summary = 'Standard hiring patterns detected. No critical anomalies found.';
  if (riskLevel === 'CRITICAL') {
    summary = 'Critical risk detected! Strong scam indicators identified (upfront fee / suspicious channels). We strongly advise against applying.';
  } else if (riskLevel === 'HIGH') {
    summary = 'Multiple risk signals detected. Exercise elevated caution before sharing documents or contact info.';
  } else if (riskLevel === 'MEDIUM') {
    summary = 'A few unusual signals noticed. Verify company credentials and avoid unverified communication.';
  }

  // AI Guidance
  let aiGuidance = 'This job posting aligns well with legitimate employment standards. Standard application procedures are recommended.';
  if (hasPaymentRequest) {
    aiGuidance = 'Never send money, crypto, or purchase gift cards for a job offer. Official companies provide all necessary equipment and onboarding at zero expense to you.';
  } else if (communicationStatus === 'warning') {
    aiGuidance = 'Keep all recruitment communications on the official job platform. If contacted on WhatsApp or Telegram, ask for an official corporate email confirmation first.';
  } else if (emailStatus === 'warning') {
    aiGuidance = 'The recruiter is using a generic public email address. Cross-reference the company on their official website or LinkedIn page before replying.';
  }

  const healthCheck: HealthCheck = {
    companyWebsite: {
      status: websiteStatus,
      label: websiteLabel,
      detail: job.companyWebsite || job.company
    },
    recruiterEmail: {
      status: emailStatus,
      label: emailLabel,
      detail: emailDetail
    },
    salaryRealism: {
      status: salaryStatus,
      label: salaryLabel,
      detail: job.salary || 'Standard band'
    },
    communication: {
      status: communicationStatus,
      label: communicationLabel,
      detail: commEvidence
    },
    officialListing: {
      status: isATS ? 'safe' : 'neutral',
      label: isATS ? 'Verified Official ATS' : 'Standard Web Posting'
    }
  };

  return {
    riskScore: finalScore,
    riskLevel,
    summary,
    signals,
    healthCheck,
    aiGuidance,
    analyzedAt: Date.now(),
    job,
    communityReportsCount: 0
  };
}
