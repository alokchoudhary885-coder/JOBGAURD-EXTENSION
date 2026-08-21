import { analyzeJobLocally } from './src/shared/ruleEngine.ts';

const fixture = {
  id: 'high_risk_hindi_ghar_baithe_typing',
  name: 'Hindi/Hinglish "Ghar Baithe Kamayein" High Salary Trap',
  expectedBand: 'HIGH',
  job: {
    title: 'Ghar Baithe Typing Job',
    company: 'Online Seva Kendra Group',
    recruiterEmail: 'ghar.baithe.jobs@gmail.com',
    jobUrl: 'https://internshala.com/job/detail/ghar-baithe-99',
    platform: 'internshala',
    extractedAt: Date.now(),
    description: 'Ghar baithe kamayein 60000 per month! Bina interview job direct selection bina kisi qualification ke. WhatsApp par message karein wa.me/919876543210 aaj hi.'
  }
};

console.log('=== EXTENSION CLIENT ENGINE EXECUTION ===');
const clientRes = analyzeJobLocally(fixture.job as any);
console.log('Ruleset Version:', clientRes.rulesetVersion);
console.log('Risk Score:', clientRes.riskScore);
console.log('Risk Level:', clientRes.riskLevel);
console.log('Signals Count:', clientRes.signals.length);
let clientSum = 0;
clientRes.signals.forEach(s => {
  console.log(` - [${s.id}] impact: +${s.impactScore}, title: "${s.title}", evidence: ${JSON.stringify(s.evidence || 'N/A')}`);
  clientSum += s.impactScore;
});
console.log('Sum of impact scores:', clientSum, '-> Equal to riskScore?', clientSum === clientRes.riskScore);
