import { JobMetadata, AnalysisResult, RiskSignal, RiskLevel, ConfidenceLevel, HealthCheck } from '../types';

export const RULESET_VERSION = '2.0.0';

const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.co.in', 'hotmail.com', 'outlook.com',
  'rediffmail.com', 'aol.com', 'protonmail.com', 'mailinator.com', 'tempmail.com',
  'zoho.com', 'yopmail.com', 'gmx.com'
];

const REPUTABLE_ATS_DOMAINS = [
  'greenhouse.io', 'lever.co', 'workday.com', 'myworkdayjobs.com',
  'smartrecruiters.com', 'ashbyhq.com', 'jobvite.com', 'bamboohr.com',
  'icims.com', 'taleo.net', 'recruitee.com', 'rippling.com'
];

// English + Hindi/Hinglish Urgency Phrases
const URGENCY_PHRASES = [
  'apply immediately', 'limited seats', 'slots filling fast', 'urgent hiring',
  'urgent requirement', 'immediate joining', 'direct selection', 'limited vacancies',
  'hurry up', 'apply right now', 'offer letter today', 'instant joining',
  // Hindi / Hinglish phrases
  'turant selection', 'turant joining', 'jaldi apply karein', 'jaldi karein',
  'limited seats bache hain', 'aaj hi join karein', 'urgent vacancy hai', 'turant offer letter'
];

export function analyzeJobLocally(job: JobMetadata): AnalysisResult {
  const signals: RiskSignal[] = [];
  let calculatedScore = 0;
  const desc = (job.description || '').toLowerCase();
  const title = (job.title || '').toLowerCase();
  const url = (job.jobUrl || '').toLowerCase();

  // 1. Payment Requests (+35 / +30) — English & Hindi/Hinglish coverage
  const feeMatch = desc.match(/(registration|training|security|processing|documentation|uniform|laptop|software|id\s*card)\s*(fee|deposit|charge|amount|cost|money|paisa|paise|fees)|refundable\s*deposit|pay\s*(inr|rs\.?|₹|\$)\s*\d+|registration\s*ka\s*paisa|security\s*jama\s*karein|training\s*fees\s*dena\s*hoga/i);
  if (feeMatch) {
    signals.push({
      id: 'fee_extortion',
      type: 'payment',
      category: 'critical',
      title: 'Upfront Payment or Deposit Required',
      description: 'The posting explicitly mentions upfront fees, security deposits, or candidate charges. Legitimate employers never charge candidates.',
      evidence: feeMatch[0],
      impactScore: 35
    });
    calculatedScore += 35;
  }

  const bankDetailMatch = desc.match(/(bank\s*account|upi\s*pin|cvv|debit\s*card|credit\s*card|net\s*banking|otp\s*verification|crypto\s*wallet|send\s*money|transfer\s*funds|khata\s*number|bank\s*detail)/i);
  if (bankDetailMatch) {
    signals.push({
      id: 'sensitive_financial_request',
      type: 'payment',
      category: 'critical',
      title: 'Premature Financial/Banking Request',
      description: 'The posting asks for banking details, UPI PIN, or card information prior to formal employment.',
      evidence: bankDetailMatch[0],
      impactScore: 30
    });
    calculatedScore += 30;
  }

  // 2. Contact Channels (+15 / +15)
  let extractedEmail = job.recruiterEmail;
  if (!extractedEmail) {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const match = job.description.match(emailRegex);
    if (match) extractedEmail = match[1];
  }

  let isFreeEmail = false;
  let isCorporateEmail = false;

  if (extractedEmail) {
    const domain = extractedEmail.split('@')[1]?.toLowerCase();
    if (domain) {
      if (FREE_EMAIL_DOMAINS.includes(domain)) {
        isFreeEmail = true;
        signals.push({
          id: 'free_email_domain',
          type: 'contact_channel',
          category: 'warning',
          title: 'Public Email Domain Used for Official Hiring',
          description: `The recruiter uses a free webmail service (@${domain}) instead of an official corporate domain.`,
          evidence: extractedEmail,
          impactScore: 15
        });
        calculatedScore += 15;
      } else {
        isCorporateEmail = true;
        signals.push({
          id: 'corporate_email_domain',
          type: 'contact_channel',
          category: 'positive',
          title: 'Corporate Email Domain Detected',
          description: `The recruiter uses an authentic domain (@${domain}).`,
          evidence: extractedEmail,
          impactScore: -10
        });
        calculatedScore -= 10;
      }
    }
  }

  const offPlatformMatch = desc.match(/(whatsapp|telegram|wa\.me|t\.me|telegram\.me|inbox\s*me\s*on\s*whatsapp|contact\s*on\s*whatsapp|whatsapp\s*par\s*message\s*karein|telegram\s*group\s*join\s*karein)/i);
  if (offPlatformMatch && !isCorporateEmail) {
    signals.push({
      id: 'off_platform_redirect',
      type: 'contact_channel',
      category: 'warning',
      title: 'Off-Platform Messaging Recruitment',
      description: 'Candidates are directed to conduct the hiring process over personal chat apps (WhatsApp/Telegram) without corporate email verification.',
      evidence: offPlatformMatch[0],
      impactScore: 15
    });
    calculatedScore += 15;
  }

  // 3. Process & Interview Standards (+10) — English & Hindi/Hinglish coverage
  const noInterviewMatch = desc.match(/(instant\s*offer|no\s*interview(\s*needed)?|direct\s*selection|direct\s*joining\s*without\s*interview|offer\s*letter\s*today|no\s*interview\s*required|bina\s*interview(\s*ke)?\s*(job|selection|joining)|seedha\s*selection|aaj\s*hi\s*joining|bina\s*kisi\s*interview)/i);
  if (noInterviewMatch) {
    signals.push({
      id: 'no_interview_instant_offer',
      type: 'process',
      category: 'warning',
      title: 'Direct Hiring Without Valid Interview Process',
      description: 'The posting promises instant selection or offer letters without standard technical screening or structured interviews.',
      evidence: noInterviewMatch[0],
      impactScore: 10
    });
    calculatedScore += 10;
  }

  // 4. Compensation & Salary Realism (+15 / +10) — Scoped exclusively to low-skill / scam-prone roles
  const isSkilledRole = [
    'engineer', 'developer', 'software', 'frontend', 'backend', 'full stack',
    'fullstack', 'devops', 'data scientist', 'machine learning', 'ml engineer',
    'architect', 'qa engineer', 'security engineer', 'programmer', 'ui/ux', 'designer'
  ].some(keyword => title.includes(keyword));

  const isLowSkillOrScamProne = [
    'data entry', 'typing', 'form filling', 'survey', 'rating', 'back office',
    'copy paste', 'home based typing', 'typing ka kaam', 'ghar baithe',
    'mystery evaluator', 'social media promoter', 'click worker', 'task worker'
  ].some(k => title.includes(k) || desc.includes(k)) ||
  desc.includes('no experience') || desc.includes('no qualification') ||
  desc.includes('bina experience') || desc.includes('bina padhai') ||
  desc.includes('bina kisi qualification') || desc.includes('bina kisi degree');

  const isUnrealisticPayTarget = isLowSkillOrScamProne && !isSkilledRole;

  const descPayMatch = desc.match(/(₹\s*[5-9]\d,\d{3}|\$\s*[5-9],\d{3}|[5-9]\d,\d{3}|80000|90000|100000|150000)\s*(per\s*month|\/month|\/mo|mahina|mahine)/i);
  const salaryPayMatch = job.salary ? /(8[0-9],000|9[0-9],000|[1-9][0-9]{5,})/i.test(job.salary) : false;
  const hasExtravagantPay = Boolean(descPayMatch || salaryPayMatch);

  const isUnrealisticCompensation = isUnrealisticPayTarget && hasExtravagantPay;

  if (isUnrealisticCompensation) {
    signals.push({
      id: 'unrealistic_compensation',
      type: 'compensation',
      category: 'warning',
      title: 'Unrealistic Compensation for Entry-Level Role',
      description: 'The stated salary is abnormally high for a low-qualification or entry-level role, a common lure used in employment phishing.',
      evidence: job.salary || (descPayMatch ? descPayMatch[0] : 'Abnormal pay rate'),
      impactScore: 15
    });
    calculatedScore += 15;
  }

  // 5. Urgency & Description Quality (+8 / +5) — English & Hindi/Hinglish coverage
  let urgencyCount = 0;
  for (const phrase of URGENCY_PHRASES) {
    if (desc.includes(phrase)) urgencyCount++;
  }

  if (!job.salary && urgencyCount > 0) {
    signals.push({
      id: 'no_salary_high_urgency',
      type: 'compensation',
      category: 'warning',
      title: 'Missing Salary with High Urgency Pressure',
      description: 'Compensation details are withheld while exerting urgency on applicants to register immediately.',
      impactScore: 10
    });
    calculatedScore += 10;
  } else if (urgencyCount >= 2) {
    signals.push({
      id: 'high_urgency_density',
      type: 'description_quality',
      category: 'warning',
      title: 'Artificial Scarcity and Urgency Language',
      description: 'The job posting exerts aggressive pressure (e.g. "urgent joining", "limited seats", "turant selection") typical of high-turnover lures.',
      impactScore: 8
    });
    calculatedScore += 8;
  }

  const grammarAnomalyMatch = desc.match(/(100%\s*gurantee|earn\s*money\s*fastly|daily\s*payment\s*system|home\s*based\s*typing\s*work|part\s*time\s*online\s*work|ghar\s*baithe\s*(kamayein|paise\s*kamaye|kamaye|job|kaam)|rozana\s*(paise|kamai|kamayein)|bina\s*kisi\s*qualification|typing\s*ka\s*kaam\s*ghar\s*se)/i);
  if (grammarAnomalyMatch) {
    signals.push({
      id: 'spam_language_pattern',
      type: 'description_quality',
      category: 'warning',
      title: 'Generic Spam Language Pattern Detected',
      description: 'Phrasing matches common mass-posted freelance or data-entry recruitment templates.',
      evidence: grammarAnomalyMatch[0],
      impactScore: 5
    });
    calculatedScore += 5;
  }

  // 6. Company Verification & Domain Match (+15 / -10)
  const isAtsUrl = REPUTABLE_ATS_DOMAINS.some(ats => url.includes(ats));
  if (isAtsUrl || (job.isJsonLd && job.companyWebsite && !isFreeEmail)) {
    signals.push({
      id: 'verified_ats_portal',
      type: 'company_verification',
      category: 'positive',
      title: 'Enterprise ATS / Verified Schema Posting',
      description: 'This position is hosted on a verified applicant tracking system or complete Schema.org job posting.',
      impactScore: -10
    });
    calculatedScore -= 10;
  } else if (!job.companyWebsite && !job.isJsonLd && !isCorporateEmail) {
    signals.push({
      id: 'unverified_company_website',
      type: 'company_verification',
      category: 'warning',
      title: 'Unverified Corporate Presence',
      description: 'No verified official careers page or structured schema could be automatically confirmed.',
      impactScore: 15
    });
    calculatedScore += 15;
  }

  // Score clamping (0 to 100)
  const finalScore = Math.max(0, Math.min(100, calculatedScore));

  // Risk Band
  let riskLevel: RiskLevel = 'LOW';
  if (finalScore >= 76) riskLevel = 'CRITICAL';
  else if (finalScore >= 51) riskLevel = 'HIGH';
  else if (finalScore >= 26) riskLevel = 'MEDIUM';

  // Confidence Level Determination
  let confidence: ConfidenceLevel = 'HIGH';
  let confidenceReason: string | undefined;

  const descLen = job.description ? job.description.trim().length : 0;
  if (descLen < 50) {
    confidence = 'LOW';
    confidenceReason = 'Low confidence — insufficient description text extracted to perform a complete assessment.';
  } else if (descLen < 150) {
    confidence = 'MEDIUM';
    confidenceReason = 'Moderate confidence — partial job posting details available.';
  }

  // Health Checks
  const healthCheck: HealthCheck = {
    companyWebsite: {
      status: (job.companyWebsite || isAtsUrl) ? 'safe' : 'neutral',
      label: isAtsUrl ? 'Enterprise ATS Verified' : (job.companyWebsite ? 'Verified Domain' : 'Standard Web Portal'),
      detail: job.companyWebsite || job.company
    },
    recruiterEmail: {
      status: isCorporateEmail ? 'safe' : (isFreeEmail ? 'warning' : 'neutral'),
      label: isCorporateEmail
        ? `${extractedEmail?.split('@')[1]} (Corporate)`
        : (isFreeEmail ? `${extractedEmail?.split('@')[1]} (Public Webmail)` : 'Not Disclosed'),
      detail: extractedEmail
    },
    salaryRealism: {
      status: isUnrealisticCompensation ? 'warning' : 'safe',
      label: isUnrealisticCompensation ? 'Unrealistic Band' : (job.salary ? 'Market Standard' : 'Disclosed on Application'),
      detail: job.salary
    },
    communication: {
      status: (offPlatformMatch && !isCorporateEmail) ? 'warning' : 'safe',
      label: (offPlatformMatch && !isCorporateEmail) ? 'WhatsApp / Off-Platform' : 'Standard Portal Application'
    },
    officialListing: {
      status: (isAtsUrl || job.isJsonLd) ? 'safe' : 'neutral',
      label: isAtsUrl ? 'Enterprise Job Board' : (job.isJsonLd ? 'Verified Schema.org' : 'Standard Web Posting')
    }
  };

  // Summary
  let summary = 'Standard hiring patterns detected. No critical anomalies identified.';
  if (riskLevel === 'CRITICAL') {
    summary = 'Critical risk detected! Posting exhibits high-confidence fraud or fee extortion markers.';
  } else if (riskLevel === 'HIGH') {
    summary = 'High caution advised: Multiple suspicious recruitment anomalies identified.';
  } else if (riskLevel === 'MEDIUM') {
    summary = 'Moderate risk: Unverified contact channels or unconfirmed corporate presence detected.';
  }

  return {
    riskScore: finalScore,
    riskLevel,
    confidence,
    confidenceReason,
    rulesetVersion: RULESET_VERSION,
    summary,
    signals,
    healthCheck,
    analyzedAt: Date.now(),
    job,
    communityReportsCount: 0
  };
}
