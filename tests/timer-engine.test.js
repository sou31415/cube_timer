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


test('press during inspection does not start solve implicitly', () => {
  const time = fakeNow();
  const engine = createTimerEngine(time.now);

  engine.pressStart();
  time.tick(250);
  engine.releaseStart();

  const pressed = engine.pressStart();
  assert.equal(pressed.type, 'noop');
  assert.equal(engine.getState(), 'inspection');

  const started = engine.startSolveFromInspection();
  assert.equal(started.type, 'solve-started');
  assert.equal(engine.getState(), 'solving');
});
