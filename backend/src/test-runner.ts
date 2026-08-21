import { analyzeJobLocally, RULESET_VERSION } from './services/ruleEngine';
import { JobMetadata } from './types';

interface TestCase {
  name: string;
  job: JobMetadata;
  expectedLevel: string;
  expectedConfidence?: string;
  mustHaveSignalId?: string;
}

const testCases: TestCase[] = [
  {
    name: '1. Legitimate Enterprise (Stripe / Lever ATS / Verified Schema)',
    expectedLevel: 'LOW',
    expectedConfidence: 'HIGH',
    job: {
      title: 'Senior Software Engineer',
      company: 'Stripe Inc.',
      recruiterEmail: 'recruiting@stripe.com',
      companyWebsite: 'https://stripe.com/jobs',
      jobUrl: 'https://jobs.lever.co/stripe/frontend-engineer',
      platform: 'career_portal',
      isJsonLd: true,
      extractedAt: Date.now(),
      description: 'Stripe is looking for a Senior Software Engineer to lead frontend architecture. Requires 5+ years of experience with TypeScript, React, distributed systems. Comprehensive medical benefits and competitive equity.'
    }
  },
  {
    name: '2. Unverified Startup with Gmail & WhatsApp Channel',
    expectedLevel: 'MEDIUM',
    expectedConfidence: 'HIGH',
    mustHaveSignalId: 'free_email_domain',
    job: {
      title: 'Full Stack Web Developer Intern',
      company: 'Apex Media Corp',
      recruiterEmail: 'apex.hr@gmail.com',
      jobUrl: 'https://linkedin.com/jobs/view/123',
      platform: 'linkedin',
      extractedAt: Date.now(),
      description: 'Looking for enthusiastic interns to join our marketing agency. Candidates will work on frontend pages and internal tools. Contact HR directly on WhatsApp at wa.me/919876543210 for interview timing and slot confirmation.'
    }
  },
  {
    name: '3. Critical Extortion & Registration Fee Trap',
    expectedLevel: 'CRITICAL',
    expectedConfidence: 'HIGH',
    mustHaveSignalId: 'fee_extortion',
    job: {
      title: 'Online Typing & Data Entry Assistant',
      company: 'FastJobs Online',
      recruiterEmail: 'jobsupport@tempmail.com',
      jobUrl: 'https://internshala.com/job/detail/fake-entry',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Earn 80000 per month from home! Direct selection with no interview needed. Candidate must deposit a refundable registration fee of INR 1500 for document clearance and kit. Join t.me/fastjobsofficial to pay now.'
    }
  },
  {
    name: '4. Sparse Posting (Low Confidence Trigger)',
    expectedLevel: 'LOW',
    expectedConfidence: 'LOW',
    job: {
      title: 'Developer',
      company: 'QuickHire',
      jobUrl: 'https://indeed.com/viewjob?jk=sparse',
      platform: 'indeed',
      extractedAt: Date.now(),
      description: 'Hiring.'
    }
  }
];

console.log('🧪 ====================================================');
console.log(`   RUNNING JOBGUARD v${RULESET_VERSION} VALIDATION TEST SUITE`);
console.log('=======================================================\n');

let passed = 0;

for (const tc of testCases) {
  const result = analyzeJobLocally(tc.job);

  const isLevelMatch = result.riskLevel === tc.expectedLevel;
  const isConfidenceMatch = !tc.expectedConfidence || result.confidence === tc.expectedConfidence;
  const isSignalMatch = !tc.mustHaveSignalId || result.signals.some(s => s.id === tc.mustHaveSignalId);
  const isVersionMatch = result.rulesetVersion === RULESET_VERSION;

  const testPassed = isLevelMatch && isConfidenceMatch && isSignalMatch && isVersionMatch;
  if (testPassed) passed++;

  console.log(`Test: ${tc.name}`);
  console.log(` - Score: ${result.riskScore}/100 [${result.riskLevel}]`);
  console.log(` - Confidence: ${result.confidence} ${result.confidenceReason ? `("${result.confidenceReason}")` : ''}`);
  console.log(` - Signals Flagged: ${result.signals.length} ${result.signals.map(s => `[${s.id}]`).join(', ')}`);
  console.log(` - Ruleset Version: ${result.rulesetVersion}`);
  console.log(` - Result: ${testPassed ? '✅ PASSED' : '❌ FAILED'}\n`);
}

console.log(`Results: ${passed} / ${testCases.length} Passed.`);
if (passed === testCases.length) {
  console.log('🎉 All deterministic rule engine test fixtures passed with 100% accuracy!');
  process.exit(0);
} else {
  process.exit(1);
}
