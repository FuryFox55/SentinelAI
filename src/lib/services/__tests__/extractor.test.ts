import assert from 'node:assert';
import { test, describe } from 'node:test';
import { extractThreatIndicators } from '../extractor';

describe('Threat Extractor Engine', () => {
  test('flags suspicious extortion and Vishing keywords in transcript', () => {
    const transcript = 'This is Officer Sharma from CBI. You are under digital arrest. Transfer OTP immediately.';
    const indicators = extractThreatIndicators(transcript);

    assert.ok(indicators.keywords.length > 0);
    assert.ok(indicators.score >= 50);
  });

  test('returns zero risk score for benign conversational input', () => {
    const text = 'Hello, let us meet for lunch at 1 PM.';
    const indicators = extractThreatIndicators(text);

    assert.strictEqual(indicators.keywords.length, 0);
    assert.strictEqual(indicators.score, 0);
  });
});
