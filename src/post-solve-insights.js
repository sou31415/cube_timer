function formatDelta(ms) {
  const sign = ms > 0 ? '+' : '';
  return `${sign}${(ms / 1000).toFixed(2)}s`;
}

export function computeRecentStability(solves, windowSize = 5) {
  if (solves.length < windowSize) {
    return null;
  }

  const recent = solves.slice(-windowSize).filter((solve) => solve.result !== 'DNF');
  if (recent.length < 3) {
    return null;
  }

  const mean = recent.reduce((sum, solve) => sum + solve.resultMs, 0) / recent.length;
  const variance = recent.reduce((sum, solve) => {
    const diff = solve.resultMs - mean;
    return sum + diff * diff;
  }, 0) / recent.length;

  return Math.sqrt(variance);
}

export function chooseMiniFeedback({ solves, current, previous, ao5Ms, prevAo5Ms, inspectionMs }) {
  if (previous && current.result !== 'DNF' && previous.result !== 'DNF') {
    const delta = current.resultMs - previous.resultMs;
    if (Math.abs(delta) >= 300) {
      return delta < 0 ? `前回より ${formatDelta(delta)} 改善` : `前回より ${formatDelta(delta)} 遅い`;
    }
  }

  if (prevAo5Ms !== null && ao5Ms !== null && ao5Ms !== 'DNF' && prevAo5Ms !== 'DNF') {
    const delta = ao5Ms - prevAo5Ms;
    if (delta < 0) {
      return `Ao5 更新 ${formatDelta(delta)}`;
    }
  }

  if (inspectionMs >= 14000 && inspectionMs < 15000) {
    return 'インスペクションが+2圏に接近';
  }

  if (inspectionMs >= 15000) {
    return 'インスペクション超過に注意';
  }

  if (solves.length >= 5) {
    return 'テンポ維持で次の5本へ';
  }

  return '良いリズムを維持';
}

export function chooseContextHint({ solves, meanMs, ao5Ms, bestAo5Ms }) {
  const stability = computeRecentStability(solves, 5);

  if (ao5Ms !== null && ao5Ms !== 'DNF' && bestAo5Ms !== null) {
    const diff = ao5Ms - bestAo5Ms;
    if (diff <= 0) {
      return 'Context: ベストAo5を更新';
    }
    return `Context: Best Ao5まで ${(diff / 1000).toFixed(2)}s`;
  }

  if (stability !== null && solves.length >= 5) {
    return `Context: 直近5本の安定度 ±${(stability / 1000).toFixed(2)}s`;
  }

  if (meanMs !== null && solves.length >= 3) {
    return `Context: Session mean ${(meanMs / 1000).toFixed(2)}s`;
  }

  return 'Context: データ蓄積中';
}

export function shouldSuggestBreak(solveCount, interval = 12) {
  return solveCount > 0 && solveCount % interval === 0;
}
