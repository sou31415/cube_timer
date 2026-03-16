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

test('hold under threshold does not start inspection', () => {
  const time = fakeNow();
  const engine = createTimerEngine(time.now);

  engine.pressStart();
  time.tick(199);
  const result = engine.releaseStart();

  assert.equal(result.type, 'hold-too-short');
  assert.equal(engine.getState(), 'idle');
});

test('inspection penalty transitions to +2 and DNF', () => {
  const time = fakeNow();
  const engine = createTimerEngine(time.now);

  engine.pressStart();
  time.tick(210);
  engine.releaseStart();

  time.tick(15100);
  let start = engine.startSolveFromInspection();
  assert.equal(start.penalty, '+2');

  const engine2 = createTimerEngine(time.now);
  engine2.pressStart();
  time.tick(210);
  engine2.releaseStart();
  time.tick(17100);
  start = engine2.startSolveFromInspection();
  assert.equal(start.penalty, 'DNF');
});

test('press during inspection does not start solve until explicit transition', () => {
  const time = fakeNow();
  const engine = createTimerEngine(time.now);

  engine.pressStart();
  time.tick(210);
  engine.releaseStart();

  const pressEvent = engine.pressStart();
  assert.equal(pressEvent.type, 'noop');
  assert.equal(engine.getState(), 'inspection');

  const start = engine.startSolveFromInspection();
  assert.equal(start.type, 'solve-started');
  assert.equal(engine.getState(), 'solving');
});
