import { analyzeJobLocally as analyzeBackend } from './services/ruleEngine';
import { VALIDATION_FIXTURES } from './validation-fixtures';

async function main() {
  const fixture = VALIDATION_FIXTURES.find(f => f.id === 'high_risk_hindi_ghar_baithe_typing')!;

  console.log('=== BACKEND ENGINE EXECUTION ===');
  const backendRes = analyzeBackend(fixture.job);
  console.log('Ruleset Version:', backendRes.rulesetVersion);
  console.log('Risk Score:', backendRes.riskScore);
  console.log('Risk Level:', backendRes.riskLevel);
  console.log('Signals Count:', backendRes.signals.length);
  let backendSum = 0;
  backendRes.signals.forEach(s => {
    console.log(` - [${s.id}] impact: +${s.impactScore}, title: "${s.title}", evidence: ${JSON.stringify(s.evidence || 'N/A')}`);
    backendSum += s.impactScore;
  });
  console.log('Sum of impact scores:', backendSum, '-> Equal to riskScore?', backendSum === backendRes.riskScore);

  console.log('\n=== CLIENT ENGINE EXECUTION (via ESM import) ===');
  // Load client file via dynamic import
  const clientModule = await import('../../extension/src/shared/ruleEngine');
  const clientRes = clientModule.analyzeJobLocally(fixture.job);
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
}

main().catch(console.error);
