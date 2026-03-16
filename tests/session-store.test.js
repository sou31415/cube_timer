import test from 'node:test';
import assert from 'node:assert/strict';
import { computeAo5, computeMean, createSessionStore } from '../src/session-store.js';

test('compute mean ignores DNF', () => {
  const mean = computeMean([
    { result: 'OK', resultMs: 10000 },
    { result: 'DNF', resultMs: 50000 },
    { result: '+2', resultMs: 12000 }
  ]);

  assert.equal(mean, 11000);
});

test('ao5 with one DNF is valid if trimmed', () => {
  const ao5 = computeAo5([
    { result: 'OK', resultMs: 10000 },
    { result: 'OK', resultMs: 11000 },
    { result: 'DNF', resultMs: 0 },
    { result: 'OK', resultMs: 12000 },
    { result: 'OK', resultMs: 13000 }
  ]);

  assert.equal(ao5, 12000);
});

test('ao5 with two DNFs is DNF', () => {
  const ao5 = computeAo5([
    { result: 'DNF', resultMs: 0 },
    { result: 'OK', resultMs: 11000 },
    { result: 'DNF', resultMs: 0 },
    { result: 'OK', resultMs: 12000 },
    { result: 'OK', resultMs: 13000 }
  ]);

  assert.equal(ao5, 'DNF');
});

test('can apply immediate correction and undo last solve', () => {
  const store = createSessionStore();
  store.addSolve({ rawMs: 10000, resultMs: 10000, result: 'OK' });

  store.updateLastResult('+2');
  let snap = store.snapshot();
  assert.equal(snap.lastSolve.result, '+2');
  assert.equal(snap.lastSolve.resultMs, 12000);

  store.updateLastResult('DNF');
  snap = store.snapshot();
  assert.equal(snap.lastSolve.result, 'DNF');

  store.undoLast();
  snap = store.snapshot();
  assert.equal(snap.lastSolve, null);
});
