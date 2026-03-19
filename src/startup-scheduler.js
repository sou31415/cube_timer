export function scheduleAfterPaint(callback) {
  requestAnimationFrame(() => {
    callback();
  });
}

export function scheduleIdleTask(callback, timeoutMs = 200) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      callback();
    }, { timeout: timeoutMs });
    return;
  }

  window.setTimeout(callback, timeoutMs);
}
