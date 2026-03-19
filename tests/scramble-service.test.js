import test from 'node:test';
import assert from 'node:assert/strict';
import { createScrambleRuntimeLoader, generateScramble } from '../src/scramble-service.js';

test('scramble runtime loader memoizes imports and configures search once', async () => {
  let scrambleImports = 0;
  let searchImports = 0;
  const debugOptions = [];

  const loadRuntime = createScrambleRuntimeLoader({
    importScrambleModule: async () => {
      scrambleImports += 1;
      return {
        randomScrambleForEvent: async () => ({
          toString: () => "R U R' U'",
        }),
      };
    },
    importSearchModule: async () => {
      searchImports += 1;
      return {
        setSearchDebug: (options) => debugOptions.push(options),
      };
    },
  });

  const first = await loadRuntime();
  const second = await loadRuntime();

  assert.equal(scrambleImports, 1);
  assert.equal(searchImports, 1);
  assert.equal(first.randomScrambleForEvent, second.randomScrambleForEvent);
  assert.deepEqual(debugOptions, [{
    logPerf: false,
    scramblePrefetchLevel: 'none',
  }]);
});

test('generateScramble requests a 3x3 scramble and serializes the alg', async () => {
  let requestedEvent = '';

  const scramble = await generateScramble(async () => ({
    randomScrambleForEvent: async (eventId) => {
      requestedEvent = eventId;
      return {
        toString: () => "R U R' U'",
      };
    },
  }));

  assert.equal(requestedEvent, '333');
  assert.equal(scramble, "R U R' U'");
});
