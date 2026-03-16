import { generateScramble } from './scramble-service.js';

export function createScrambleQueue(generator = generateScramble, preloadSize = 2) {
  const queue = [];

  function fill() {
    while (queue.length < preloadSize) {
      queue.push(generator());
    }
  }

  function next() {
    fill();
    const current = queue.shift();
    fill();
    return current;
  }

  fill();

  return {
    next,
    size: () => queue.length,
    peek: () => [...queue],
  };
}
