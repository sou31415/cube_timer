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
      inspectionStart = now();
      state = 'inspection';
      return { type: 'inspection-started' };
    }

    if (state === 'inspection') {
      holdStart = now();
      state = 'inspection-holding';
      return { type: 'inspection-holding' };
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
    if (state !== 'inspection-holding') {
      return { type: 'noop' };
    }

    if (now() - holdStart < HOLD_THRESHOLD_MS) {
      state = 'inspection';
      return { type: 'solve-hold-too-short' };
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

    if (state === 'inspection' || state === 'inspection-holding') {
      return now() - inspectionStart;
    }

    return 0;
  }

  function getReadyVisualState() {
    if (state !== 'inspection-holding') {
      return 'not-ready';
    }

    return now() - holdStart >= HOLD_THRESHOLD_MS ? 'ready' : 'not-ready';
  }

  return {
    getState,
    pressStart,
    releaseStart,
    getElapsedMs,
    getReadyVisualState,
  };
}
