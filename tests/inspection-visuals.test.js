import test from 'node:test';
import assert from 'node:assert/strict';
import { getInspectionVisual } from '../src/inspection-visuals.js';

test('inspection visual transitions from calm to imminent', () => {
  assert.equal(getInspectionVisual(3000).tone, 'calm');
  assert.equal(getInspectionVisual(9000).tone, 'focus');
  assert.equal(getInspectionVisual(12500).tone, 'alert');
  assert.equal(getInspectionVisual(14050).tone, 'imminent');
});

test('inspection overtime and dnf are distinguished', () => {
  assert.equal(getInspectionVisual(15500).tone, 'overtime');
  assert.equal(getInspectionVisual(17200).tone, 'dnf');
});
