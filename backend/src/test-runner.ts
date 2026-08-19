import { runRuleEngine } from './services/ruleEngine';
import { JobMetadata } from './types';

const testCases: { name: string; job: JobMetadata; expectedLevel: string }[] = [
  {
    name: '1. Legitimate Enterprise (Stripe / Lever)',
    expectedLevel: 'LOW',
    job: {
      title: 'Senior Software Engineer',
      company: 'Stripe',
      recruiterEmail: 'recruiting@stripe.com',
      jobUrl: 'https://jobs.lever.co/stripe/frontend-engineer',
      platform: 'career_portal',
      extractedAt: Date.now(),
      description: 'Stripe is looking for a Senior Software Engineer to lead frontend architecture. Requires 5+ years of experience with TypeScript, React, distributed systems. Comprehensive medical benefits and competitive equity.'
    }
  },
  {
    name: '2. Unverified Startup with Gmail & WhatsApp',
    expectedLevel: 'MEDIUM',
    job: {
      title: 'Full Stack Web Developer Intern',
      company: 'Apex Media Corp',
      recruiterEmail: 'apex.hr@gmail.com',
      jobUrl: 'https://linkedin.com/jobs/view/123',
      platform: 'linkedin',
      extractedAt: Date.now(),
      description: 'Looking for interns. Contact HR directly on WhatsApp at wa.me/919876543210 for interview timing.'
    }
  },
  {
    name: '3. Extortion & Registration Fee Trap',
    expectedLevel: 'CRITICAL',
    job: {
      title: 'Online Typing & Data Entry Assistant',
      company: 'FastJobs Online',
      recruiterEmail: 'jobsupport@tempmail.com',
      jobUrl: 'https://internshala.com/job/detail/fake-entry',
      platform: 'internshala',
      extractedAt: Date.now(),
      description: 'Earn 80000 per month! Direct selection with no skills required. Candidate must deposit a refundable registration fee of INR 1200 for document clearance. Join t.me/fastjobsofficial to pay.'
    }
  }
];

console.log('🧪 ===============================================');
console.log('   RUNNING JOBGUARD RISK ENGINE VALIDATION SUITE  ');
console.log('==================================================\n');

let passed = 0;

for (const tc of testCases) {
  const result = runRuleEngine(tc.job);
  let riskLevel = 'LOW';
  if (result.score >= 76) riskLevel = 'CRITICAL';
  else if (result.score >= 51) riskLevel = 'HIGH';
  else if (result.score >= 26) riskLevel = 'MEDIUM';

  const isMatch = riskLevel === tc.expectedLevel;
  if (isMatch) passed++;

  console.log(`Test: ${tc.name}`);
  console.log(` - Calculated Risk Score: ${result.score}/100 [${riskLevel}]`);
  console.log(` - Signals Flagged: ${result.signals.length}`);
  console.log(` - Expected Level: ${tc.expectedLevel} => ${isMatch ? '✅ PASSED' : '❌ FAILED'}\n`);
}

console.log(`Results: ${passed} / ${testCases.length} Passed.`);
if (passed === testCases.length) {
  console.log('🎉 All automated risk engine test fixtures passed successfully!');
  process.exit(0);
} else {
  process.exit(1);
}
