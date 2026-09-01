import assert from 'node:assert';
import { test, describe } from 'node:test';
import { evaluateFraudConfidence } from '../scoring';

describe('Fraud Confidence Engine', () => {
  test('evaluates safe inputs with Low/None threat level', () => {
    const result = evaluateFraudConfidence({
      callerReputation: 0,
      voiceCloneProbability: 5,
      suspiciousKeywords: [],
      voipRoutingScore: 0,
      behaviorAnomalyRating: 0
    });

    assert.strictEqual(result.threatLevel, 'None');
    assert.strictEqual(result.fraudConfidenceIndex, 2);
    assert.ok(result.recommendations.length > 0);
  });

  test('evaluates high clone probability and keywords as High or Critical threat', () => {
    const result = evaluateFraudConfidence({
      callerReputation: 85,
      voiceCloneProbability: 95,
      suspiciousKeywords: ['CBI', 'digital arrest', 'transfer OTP'],
      voipRoutingScore: 80,
      behaviorAnomalyRating: 90
    });

    assert.ok(result.fraudConfidenceIndex >= 85);
    assert.strictEqual(result.threatLevel, 'Critical');
    assert.ok(result.evidence.some(e => e.includes('voice cloning')));
  });
});
