const FACES = ['R', 'L', 'U', 'D', 'F', 'B'];
const SUFFIXES = ['', "'", '2'];

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function generateScramble(length = 20) {
  const moves = [];

  while (moves.length < length) {
    const face = randomItem(FACES);
    const suffix = randomItem(SUFFIXES);

    const prev = moves[moves.length - 1];
    if (prev && prev[0] === face) {
      continue;
    }

    moves.push(`${face}${suffix}`);
  }

  return moves.join(' ');
}
