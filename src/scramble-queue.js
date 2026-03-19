import { generateScramble } from './scramble-service.js';

function createEntry(generator) {
  return {
    promise: Promise.resolve().then(() => generator()),
  };
}

export function createScrambleQueue(generator = generateScramble, preloadSize = 2) {
  const queue = [];

  function fill() {
    while (queue.length < preloadSize) {
      queue.push(createEntry(generator));
    }
  }

  async function next() {
    fill();
    const current = queue.shift();
    fill();
    return current.promise;
  }

  fill();

  return {
    next,
    size: () => queue.length,
    peek: async () => Promise.all(queue.map((entry) => entry.promise)),
  };
}
