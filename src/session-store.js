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

function emptyStats() {
  return {
    sumValidMs: 0,
    validCount: 0,
    ao5Ms: null,
    bestAo5Ms: null,
    recentSolves: [],
  };
}

function buildStats(solves) {
  let stats = emptyStats();

  for (const solve of solves) {
    stats = appendStats(stats, solve);
  }

  return stats;
}

function appendStats(stats, solve) {
  const valid = validMs(solve);
  const recentSolves = [...stats.recentSolves, solve].slice(-5);
  const ao5Ms = recentSolves.length === 5 ? computeAo5(recentSolves) : null;

  let bestAo5Ms = stats.bestAo5Ms;
  if (ao5Ms !== null && ao5Ms !== 'DNF') {
    bestAo5Ms = bestAo5Ms === null ? ao5Ms : Math.min(bestAo5Ms, ao5Ms);
  }

  return {
    sumValidMs: stats.sumValidMs + (valid ?? 0),
    validCount: stats.validCount + (valid === null ? 0 : 1),
    ao5Ms,
    bestAo5Ms,
    recentSolves,
  };
}

export function createSessionStore(initial = []) {
  let solves = [...initial];
  let stats = buildStats(solves);

  function rebuildStats() {
    stats = buildStats(solves);
  }

  function addSolve(solve) {
    solves.push(solve);
    stats = appendStats(stats, solve);
  }

  function reset() {
    solves = [];
    stats = emptyStats();
  }

  function undoLast() {
    if (!solves.length) {
      return null;
    }

    const removed = solves.pop();
    rebuildStats();
    return removed;
  }

  function updateLastResult(result) {
    const last = solves.at(-1);
    if (!last) {
      return null;
    }

    last.result = result;
    last.resultMs = recalculateResultMs(last.rawMs, result);
    rebuildStats();
    return last;
  }

  function snapshot() {
    return {
      solves: [...solves],
      lastSolve: solves.at(-1) || null,
      meanMs: stats.validCount ? stats.sumValidMs / stats.validCount : null,
      ao5Ms: stats.ao5Ms,
      bestAo5Ms: stats.bestAo5Ms,
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
