function validMs(solve) {
  return solve.result === 'DNF' ? null : solve.resultMs;
}

export function formatTime(ms) {
  return (ms / 1000).toFixed(2);
}

export function computeMean(solves) {
  const valid = solves.map(validMs).filter((v) => v !== null);
  if (!valid.length) {
    return null;
  }

  const total = valid.reduce((sum, v) => sum + v, 0);
  return total / valid.length;
}

export function computeAo5(solves) {
  if (solves.length < 5) {
    return null;
  }

  const last5 = solves.slice(-5);
  const dnfCount = last5.filter((s) => s.result === 'DNF').length;

  if (dnfCount >= 2) {
    return 'DNF';
  }

  const normalized = last5.map((s) => (s.result === 'DNF' ? Number.POSITIVE_INFINITY : s.resultMs));
  normalized.sort((a, b) => a - b);

  const middle = normalized.slice(1, 4);
  if (middle.some((v) => !Number.isFinite(v))) {
    return 'DNF';
  }

  return middle.reduce((sum, v) => sum + v, 0) / middle.length;
}

function recalculateResultMs(rawMs, result) {
  if (result === '+2') {
    return rawMs + 2000;
  }

  return rawMs;
}

export function createSessionStore(initial = []) {
  let solves = [...initial];

  function addSolve(solve) {
    solves.push(solve);
  }

  function reset() {
    solves = [];
  }

  function undoLast() {
    if (!solves.length) {
      return null;
    }

    return solves.pop();
  }

  function updateLastResult(result) {
    const last = solves.at(-1);
    if (!last) {
      return null;
    }

    last.result = result;
    last.resultMs = recalculateResultMs(last.rawMs, result);
    return last;
  }

  function bestAo5Ms() {
    if (solves.length < 5) {
      return null;
    }

    const values = [];
    for (let i = 5; i <= solves.length; i += 1) {
      const value = computeAo5(solves.slice(0, i));
      if (value !== null && value !== 'DNF') {
        values.push(value);
      }
    }

    if (!values.length) {
      return null;
    }

    return Math.min(...values);
  }

  function snapshot() {
    return {
      solves: [...solves],
      lastSolve: solves.at(-1) || null,
      meanMs: computeMean(solves),
      ao5Ms: computeAo5(solves),
      bestAo5Ms: bestAo5Ms(),
    };
  }

  return {
    addSolve,
    reset,
    undoLast,
    updateLastResult,
    snapshot,
  };
}
