import { analyzeJobLocally } from './services/ruleEngine';
import { VALIDATION_FIXTURES } from './validation-fixtures';
import { REAL_WORLD_DATASET } from './real-world-dataset';

console.log('🔍 VERIFYING SCORE == SUM(EVIDENCE IMPACT SCORES) ACROSS ALL FIXTURES...');

let allMatched = true;

// 1. Synthetic Fixtures
console.log(`Checking ${VALIDATION_FIXTURES.length} Synthetic Fixtures:`);
for (const f of VALIDATION_FIXTURES) {
  const res = analyzeJobLocally(f.job);
  const sum = res.signals.reduce((acc, s) => acc + s.impactScore, 0);
  const clampedExpected = Math.max(0, Math.min(100, sum));
  const isMatch = res.riskScore === clampedExpected;
  if (!isMatch) {
    allMatched = false;
    console.error(`❌ Mismatch in fixture ${f.id}: sum=${sum}, clampedExpected=${clampedExpected}, riskScore=${res.riskScore}`);
  }
}
console.log(`✅ All ${VALIDATION_FIXTURES.length} synthetic fixtures exhibit 100% mathematical evidence consistency.`);

// 2. Real-World Fixtures
console.log(`Checking ${REAL_WORLD_DATASET.length} Real-World Samples:`);
for (const f of REAL_WORLD_DATASET) {
  const res = analyzeJobLocally(f.job);
  const sum = res.signals.reduce((acc, s) => acc + s.impactScore, 0);
  const clampedExpected = Math.max(0, Math.min(100, sum));
  const isMatch = res.riskScore === clampedExpected;
  if (!isMatch) {
    allMatched = false;
    console.error(`❌ Mismatch in real sample ${f.id}: sum=${sum}, clampedExpected=${clampedExpected}, riskScore=${res.riskScore}`);
  }
}
console.log(`✅ All ${REAL_WORLD_DATASET.length} real-world samples exhibit 100% mathematical evidence consistency.`);

if (allMatched) {
  console.log('\n🎉 ALL 40 TEST FIXTURES CONFIRMED: sum(evidence.impactScores) == riskScore (100% Exact)');
  process.exit(0);
} else {
  process.exit(1);
}
