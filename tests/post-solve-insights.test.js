import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseContextHint, chooseMiniFeedback, shouldSuggestBreak } from '../src/post-solve-insights.js';

test('mini feedback prefers previous delta', () => {
  const msg = chooseMiniFeedback({
    solves: [1, 2],
    current: { result: 'OK', resultMs: 10000 },
    previous: { result: 'OK', resultMs: 11000 },
    ao5Ms: null,
    prevAo5Ms: null,
    inspectionMs: 5000,
  });

  assert.match(msg, /改善/);
});

test('context hint shows distance to best ao5', () => {
  const msg = chooseContextHint({
    solves: [1, 2, 3, 4, 5],
    meanMs: 12000,
    ao5Ms: 12500,
    bestAo5Ms: 12000,
  });

  assert.match(msg, /Best Ao5まで/);
});

test('break suggestion appears at interval', () => {
  assert.equal(shouldSuggestBreak(12), true);
  assert.equal(shouldSuggestBreak(11), false);
});
