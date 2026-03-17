import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimerEngine } from '../src/timer-engine.js';

function fakeNow() {
  let now = 0;
  return {
    tick(ms) {
      now += ms;
    },
    now: () => now,
  };
}

test('press from idle starts inspection immediately', () => {
  const time = fakeNow();
  const engine = createTimerEngine(time.now);

  const result = engine.pressStart();

  assert.equal(result.type, 'inspection-started');
  assert.equal(engine.getState(), 'inspection');
  assert.equal(engine.getElapsedMs(), 0);
});

test('short hold during inspection does not start solve', () => {
  const time = fakeNow();
  const engine = createTimerEngine(time.now);

  engine.pressStart();
  time.tick(500);
  assert.equal(engine.pressStart().type, 'inspection-holding');
  time.tick(199);

  const result = engine.releaseStart();

  assert.equal(result.type, 'solve-hold-too-short');
  assert.equal(engine.getState(), 'inspection');
  assert.equal(engine.getElapsedMs(), 699);
});

test('hold during inspection for threshold starts solve', () => {
  const time = fakeNow();
  const engine = createTimerEngine(time.now);

  engine.pressStart();
  time.tick(1200);
  engine.pressStart();
  time.tick(200);

  const result = engine.releaseStart();

  assert.equal(result.type, 'solve-started');
  assert.equal(result.inspectionElapsedMs, 1400);
  assert.equal(result.penalty, 'OK');
  assert.equal(engine.getState(), 'solving');
});

test('inspection penalty transitions to +2 and DNF', () => {
  const time = fakeNow();
  const engine = createTimerEngine(time.now);

  engine.pressStart();
  time.tick(15100);
  engine.pressStart();
  time.tick(210);
  let result = engine.releaseStart();
  assert.equal(result.penalty, '+2');

  const engine2 = createTimerEngine(time.now);
  engine2.pressStart();
  time.tick(17100);
  engine2.pressStart();
  time.tick(210);
  result = engine2.releaseStart();
  assert.equal(result.penalty, 'DNF');
});

test('press during solving stops timer', () => {
  const time = fakeNow();
  const engine = createTimerEngine(time.now);

  engine.pressStart();
  time.tick(1000);
  engine.pressStart();
  time.tick(250);
  engine.releaseStart();
  time.tick(3210);

  const result = engine.pressStart();

  assert.equal(result.type, 'stopped');
  assert.equal(result.elapsedMs, 3210);
  assert.equal(engine.getState(), 'idle');
});
