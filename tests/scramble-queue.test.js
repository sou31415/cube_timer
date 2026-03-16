import test from 'node:test';
import assert from 'node:assert/strict';
import { createScrambleQueue } from '../src/scramble-queue.js';

test('scramble queue preloads and keeps buffer', () => {
  let n = 0;
  const queue = createScrambleQueue(() => `S${++n}`, 2);

  assert.equal(queue.size(), 2);
  const first = queue.next();
  const second = queue.next();

  assert.equal(first, 'S1');
  assert.equal(second, 'S2');
  assert.equal(queue.size(), 2);
  assert.deepEqual(queue.peek(), ['S3', 'S4']);
});
