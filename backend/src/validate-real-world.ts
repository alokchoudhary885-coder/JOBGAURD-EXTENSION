import { analyzeJobLocally } from './services/ruleEngine';
import { REAL_WORLD_DATASET, RealWorldSample } from './real-world-dataset';

interface EvaluationRecord {
  id: string;
  sourceType: string;
  label: 'SCAM' | 'LEGITIMATE';
  expectedBand: string;
  actualBand: string;
  actualScore: number;
  signals: string[];
  isScamFlagged: boolean; // Flagged as HIGH or CRITICAL risk (>= 51)
  isCorrect: boolean;
  compensationFlagged: boolean;
}

console.log('🔬 =========================================================================');
console.log('   JOBGUARD REAL-WORLD VALIDATION SUITE — PROVENANCE & EMPIRICAL BENCHMARK');
console.log('===========================================================================\n');

const records: EvaluationRecord[] = [];

for (const sample of REAL_WORLD_DATASET) {
  const analysis = analyzeJobLocally(sample.job);
  const isScamFlagged = analysis.riskScore >= 51; // High / Critical
  const isCorrect = sample.label === 'SCAM' ? isScamFlagged : !isScamFlagged;
  const compensationFlagged = analysis.signals.some(s => s.id === 'unrealistic_compensation');

  records.push({
    id: sample.id,
    sourceType: sample.sourceType,
    label: sample.label,
    expectedBand: sample.expectedBand,
    actualBand: analysis.riskLevel,
    actualScore: analysis.riskScore,
    signals: analysis.signals.map(s => s.id),
    isScamFlagged,
    isCorrect,
    compensationFlagged
  });

  const passIcon = isCorrect ? '✅' : '❌';
  console.log(`${passIcon} [${sample.label.padEnd(10)}] -> Score: ${String(analysis.riskScore).padStart(3)}/100 [${analysis.riskLevel.padEnd(8)}] | ${sample.job.title} (${sample.job.company})`);
  console.log(`     ↳ Source: ${sample.sourceType} (${sample.sourceUrl})`);
  console.log(`     ↳ Signals: ${analysis.signals.map(s => `${s.id}(${s.impactScore > 0 ? '+' : ''}${s.impactScore})`).join(', ')}`);
  if (compensationFlagged) {
    console.log(`     ⚠️ [COMPENSATION RULE FIRED] on title: "${sample.job.title}" with salary: "${sample.job.salary || 'in-text'}"`);
  }
  console.log('');
}

// Empirical Metrics Computation
const totalScams = records.filter(r => r.label === 'SCAM').length;
const totalLegit = records.filter(r => r.label === 'LEGITIMATE').length;

const truePositives = records.filter(r => r.label === 'SCAM' && r.isScamFlagged).length;
const falseNegatives = records.filter(r => r.label === 'SCAM' && !r.isScamFlagged).length;
const trueNegatives = records.filter(r => r.label === 'LEGITIMATE' && !r.isScamFlagged).length;
const falsePositives = records.filter(r => r.label === 'LEGITIMATE' && r.isScamFlagged).length;

const precision = truePositives + falsePositives > 0 ? (truePositives / (truePositives + falsePositives)) : 0;
const recall = truePositives + falseNegatives > 0 ? (truePositives / (truePositives + falseNegatives)) : 0;
const accuracy = (truePositives + trueNegatives) / records.length;

console.log('===========================================================================');
console.log('📊 EMPIRICAL METRICS ON REAL-WORLD DATASET');
console.log('===========================================================================');
console.log(`Total Dataset Samples: ${records.length} (${totalScams} Documented Scams, ${totalLegit} Legitimate Postings)`);
console.log(`- True Positives  (Scams correctly flagged HIGH/CRITICAL):   ${truePositives} / ${totalScams}`);
console.log(`- False Negatives (Scams missed / labeled LOW/MEDIUM):        ${falseNegatives} / ${totalScams}`);
console.log(`- True Negatives  (Legitimate postings kept LOW/MEDIUM):     ${trueNegatives} / ${totalLegit}`);
console.log(`- False Positives (Legitimate falsely flagged HIGH/CRITICAL): ${falsePositives} / ${totalLegit}`);
console.log('');
console.log(`CONFUSION MATRIX:`);
console.log(`                     Actual SCAM     Actual LEGIT`);
console.log(`  Predicted SCAM:        ${String(truePositives).padStart(3)}             ${String(falsePositives).padStart(3)}`);
console.log(`  Predicted LEGIT:       ${String(falseNegatives).padStart(3)}             ${String(trueNegatives).padStart(3)}`);
console.log('');
console.log(`Precision: ${(precision * 100).toFixed(1)}%`);
console.log(`Recall:    ${(recall * 100).toFixed(1)}%`);
console.log(`Accuracy:  ${(accuracy * 100).toFixed(1)}%`);
console.log('===========================================================================\n');
