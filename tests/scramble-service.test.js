import test from 'node:test';
import assert from 'node:assert/strict';
import { generateScramble } from '../src/scramble-service.js';

test('generateScramble requests a 3x3 scramble and serializes the alg', async () => {
  let requestedEvent = '';

  const scramble = await generateScramble(async (eventId) => {
    requestedEvent = eventId;
    return {
      toString: () => "R U R' U'",
    };
  });

  assert.equal(requestedEvent, '333');
  assert.equal(scramble, "R U R' U'");
});

test('generateScramble resolves to a non-empty 3x3 alg string', async () => {
  const scramble = await generateScramble();
  const tokens = scramble.split(' ');

  assert.ok(tokens.length > 0);
  for (const token of tokens) {
    assert.match(token, /^[RLUDFB](2|'|)?$/);
  }
});
