import { analyzeJobLocally } from './services/ruleEngine';
import { VALIDATION_FIXTURES, ValidationFixture } from './validation-fixtures';

interface TestResult {
  id: string;
  name: string;
  expectedBand: string;
  actualBand: string;
  actualScore: number;
  signalsCount: number;
  signals: string[];
  passed: boolean;
}

console.log('🧪 =========================================================================');
console.log('   JOBGUARD VALIDATION TEST RUNNER — UNMODIFIED RULE ENGINE vs FIXTURES');
console.log('===========================================================================\n');

const results: TestResult[] = [];
let passedCount = 0;

for (const fixture of VALIDATION_FIXTURES) {
  const analysis = analyzeJobLocally(fixture.job);
  const passed = analysis.riskLevel === fixture.expectedBand;

  if (passed) passedCount++;

  results.push({
    id: fixture.id,
    name: fixture.name,
    expectedBand: fixture.expectedBand,
    actualBand: analysis.riskLevel,
    actualScore: analysis.riskScore,
    signalsCount: analysis.signals.length,
    signals: analysis.signals.map(s => `[${s.id}: ${s.impactScore > 0 ? '+' : ''}${s.impactScore}]`),
    passed
  });

  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} | [${fixture.expectedBand.padEnd(8)}] -> Got: ${analysis.riskLevel.padEnd(8)} (Score: ${String(analysis.riskScore).padStart(3)}/100) | ${fixture.name}`);
  if (!passed) {
    console.log(`     ↳ Mismatch detail: Expected ${fixture.expectedBand}, but engine calculated ${analysis.riskLevel} (${analysis.riskScore}/100)`);
    console.log(`     ↳ Triggered Signals: ${analysis.signals.map(s => `${s.id}(${s.impactScore})`).join(', ')}`);
  }
}

console.log('\n===========================================================================');
console.log(`📊 SUMMARY: ${passedCount} / ${VALIDATION_FIXTURES.length} Fixtures Passed (${Math.round((passedCount / VALIDATION_FIXTURES.length) * 100)}% Accuracy)`);
console.log('===========================================================================\n');

// Breakdown by band
const bands = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
for (const band of bands) {
  const total = VALIDATION_FIXTURES.filter(f => f.expectedBand === band).length;
  const correct = results.filter(r => r.expectedBand === band && r.passed).length;
  console.log(`  - Band ${band.padEnd(8)}: ${correct} / ${total} correctly classified (${Math.round((correct / total) * 100)}%)`);
}

console.log('\n');
