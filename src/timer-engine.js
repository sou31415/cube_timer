export const HOLD_THRESHOLD_MS = 200;
export const INSPECTION_LIMIT_MS = 15000;
export const INSPECTION_DNF_MS = 17000;

export function createTimerEngine(now = () => performance.now()) {
  let state = 'idle';
  let holdStart = 0;
  let solveStart = 0;
  let inspectionStart = 0;

  function getState() {
    return state;
  }

  function pressStart() {
    if (state === 'idle') {
      holdStart = now();
      state = 'holding';
      return { type: 'holding' };
    }

    if (state === 'solving') {
      const elapsedMs = now() - solveStart;
      state = 'idle';
      return {
        type: 'stopped',
        elapsedMs,
      };
    }

    return { type: 'noop' };
  }

  function releaseStart() {
    if (state !== 'holding') {
      return { type: 'noop' };
    }

    if (now() - holdStart < HOLD_THRESHOLD_MS) {
      state = 'idle';
      return { type: 'hold-too-short' };
    }

    inspectionStart = now();
    state = 'inspection';
    return { type: 'inspection-started' };
  }

  function startSolveFromInspection() {
    if (state !== 'inspection') {
      return { type: 'noop' };
    }

    const inspectionElapsedMs = now() - inspectionStart;
    solveStart = now();
    state = 'solving';

    const penalty = inspectionElapsedMs > INSPECTION_DNF_MS
      ? 'DNF'
      : inspectionElapsedMs > INSPECTION_LIMIT_MS
        ? '+2'
        : 'OK';

    return {
      type: 'solve-started',
      inspectionElapsedMs,
      penalty,
    };
  }

  function getElapsedMs() {
    if (state === 'solving') {
      return now() - solveStart;
    }

    if (state === 'inspection') {
      return now() - inspectionStart;
    }

    return 0;
  }

  function getReadyVisualState() {
    if (state !== 'holding') {
      return 'not-ready';
    }

    return now() - holdStart >= HOLD_THRESHOLD_MS ? 'ready' : 'not-ready';
  }

  return {
    getState,
    pressStart,
    releaseStart,
    startSolveFromInspection,
    getElapsedMs,
    getReadyVisualState,
  };
}
