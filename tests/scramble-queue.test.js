import test from 'node:test';
import assert from 'node:assert/strict';
import { createScrambleQueue } from '../src/scramble-queue.js';

test('scramble queue stays empty until warm is called', async () => {
  let n = 0;
  const queue = createScrambleQueue(async () => `S${++n}`, 3);

  assert.equal(queue.size(), 0);

  await queue.warm(1);

  assert.equal(queue.size(), 1);
  assert.deepEqual(await queue.peek(), ['S1']);
});

test('scramble queue next only consumes warmed entries and does not auto-refill', async () => {
  let n = 0;
  const queue = createScrambleQueue(async () => `S${++n}`, 2);

  await queue.warm();
  assert.equal(queue.size(), 2);

  const first = await queue.next();
  assert.equal(first, 'S1');
  assert.equal(queue.size(), 1);

  const second = await queue.next();
  assert.equal(second, 'S2');
  assert.equal(queue.size(), 0);
});

test('scramble queue can recover after a failed entry', async () => {
  let attempts = 0;
  const queue = createScrambleQueue(async () => {
    attempts += 1;
    if (attempts === 1) {
      throw new Error('boom');
    }

    return `S${attempts}`;
  }, 1);

  await assert.rejects(queue.next(), /boom/);
  assert.equal(queue.size(), 0);

  await queue.warm(1);
  assert.equal(await queue.next(), 'S2');
});
