import test from 'node:test';
import assert from 'node:assert/strict';
import { createScrambleQueue } from '../src/scramble-queue.js';

test('scramble queue preloads and keeps the async buffer full', async () => {
  let n = 0;
  const queue = createScrambleQueue(async () => `S${++n}`, 2);

  assert.equal(queue.size(), 2);

  const first = await queue.next();
  const second = await queue.next();

  assert.equal(first, 'S1');
  assert.equal(second, 'S2');
  assert.equal(queue.size(), 2);
  assert.deepEqual(await queue.peek(), ['S3', 'S4']);
});

test('scramble queue replaces a failed entry on the next fill', async () => {
  let attempts = 0;
  const queue = createScrambleQueue(async () => {
    attempts += 1;
    if (attempts === 1) {
      throw new Error('boom');
    }

    return `S${attempts}`;
  }, 1);

  await assert.rejects(queue.next(), /boom/);
  assert.equal(await queue.next(), 'S2');
  assert.equal(queue.size(), 1);
});
