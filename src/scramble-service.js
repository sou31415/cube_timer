import { randomScrambleForEvent } from 'cubing/scramble';
import { setSearchDebug } from 'cubing/search';

const EVENT_3X3 = '333';

setSearchDebug({
  logPerf: false,
});

export async function generateScramble(scrambleForEvent = randomScrambleForEvent) {
  const alg = await scrambleForEvent(EVENT_3X3);
  return alg.toString();
}
