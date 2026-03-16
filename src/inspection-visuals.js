import { INSPECTION_DNF_MS, INSPECTION_LIMIT_MS } from './timer-engine.js';

export function getInspectionVisual(elapsedMs) {
  const remainingMs = Math.max(0, INSPECTION_LIMIT_MS - elapsedMs);

  if (elapsedMs >= INSPECTION_DNF_MS) {
    return { tone: 'dnf', text: 'DNF!', pulse: 'hard', remainingMs };
  }

  if (elapsedMs >= INSPECTION_LIMIT_MS) {
    return { tone: 'overtime', text: '+2', pulse: 'hard', remainingMs };
  }

  if (remainingMs <= 2000) {
    return { tone: 'imminent', text: 'START', pulse: 'soft', remainingMs };
  }

  if (elapsedMs >= 12000) {
    return { tone: 'alert', text: 'INSPECTION', pulse: 'soft', remainingMs };
  }

  if (elapsedMs >= 8000) {
    return { tone: 'focus', text: 'INSPECTION', pulse: 'none', remainingMs };
  }

  return { tone: 'calm', text: 'INSPECTION', pulse: 'none', remainingMs };
}
