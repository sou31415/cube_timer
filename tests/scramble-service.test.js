import test from 'node:test';
import assert from 'node:assert/strict';
import { generateScramble } from '../src/scramble-service.js';

test('scramble has expected move tokens and avoids same face in sequence', () => {
  const scramble = generateScramble(25);
  const tokens = scramble.split(' ');
  assert.equal(tokens.length, 25);

  for (let i = 0; i < tokens.length; i += 1) {
    assert.match(tokens[i], /^[RLUDFB](2|'|)?$/);
    if (i > 0) {
      assert.notEqual(tokens[i][0], tokens[i - 1][0]);
    }
  }
});
