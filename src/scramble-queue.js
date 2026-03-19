import { generateScramble } from './scramble-service.js';

function createEntry(generator) {
  return {
    promise: Promise.resolve().then(() => generator()),
  };
}

export function createScrambleQueue(generator = generateScramble, preloadSize = 2) {
  const queue = [];

  function fill(targetSize = preloadSize) {
    while (queue.length < targetSize) {
      queue.push(createEntry(generator));
    }
  }

  async function warm(targetSize = preloadSize) {
    fill(targetSize);
    await Promise.allSettled(queue.map((entry) => entry.promise));
  }

  async function next() {
    if (!queue.length) {
      fill(1);
    }

    const current = queue.shift();
    return current.promise;
  }

  return {
    next,
    warm,
    size: () => queue.length,
    peek: async () => Promise.all(queue.map((entry) => entry.promise)),
  };
}
