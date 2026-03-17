import { createTimerEngine } from './timer-engine.js';
import { createScrambleQueue } from './scramble-queue.js';
import { createSessionStore, formatTime } from './session-store.js';
import { clearSession, loadSession, saveSession } from './persistence.js';
import { chooseContextHint, chooseMiniFeedback, shouldSuggestBreak } from './post-solve-insights.js';
import { getInspectionVisual } from './inspection-visuals.js';

const scrambleEl = document.getElementById('scramble');
const timerDisplayEl = document.getElementById('timerDisplay');
const stateTextEl = document.getElementById('stateText');
const timerWrapEl = document.getElementById('timerWrap');
const lastSolveEl = document.getElementById('lastSolve');
const meanEl = document.getElementById('mean');
const ao5El = document.getElementById('ao5');
const resetButton = document.getElementById('resetButton');
const feedbackEl = document.getElementById('feedback');
const contextHintEl = document.getElementById('contextHint');
const quickActionsEl = document.getElementById('quickActions');
const quickPlus2 = document.getElementById('quickPlus2');
const quickDnf = document.getElementById('quickDnf');
const quickUndo = document.getElementById('quickUndo');
const breakPromptEl = document.getElementById('breakPrompt');
const startBreakBtn = document.getElementById('startBreak');

const restored = loadSession();
const session = createSessionStore(restored?.solves ?? []);
const timer = createTimerEngine();
const scrambleQueue = createScrambleQueue(undefined, 3);

let activeScramble = scrambleQueue.next();
let pendingPenalty = 'OK';
let feedbackTimeout;
let quickActionTimeout;
let isBreakMode = false;
let inspectionCues = new Set();
let lastInspectionElapsedMs = 0;

function displayPenalty(result, ms) {
  if (result === 'DNF') {
    return 'DNF';
  }
  if (result === '+2') {
    return `${formatTime(ms)} (+2)`;
  }
  return formatTime(ms);
}

function updateStats() {
  const snap = session.snapshot();
  lastSolveEl.textContent = snap.lastSolve ? displayPenalty(snap.lastSolve.result, snap.lastSolve.resultMs) : '-';
  meanEl.textContent = snap.meanMs === null ? '-' : formatTime(snap.meanMs);
  ao5El.textContent = snap.ao5Ms === null ? '-' : snap.ao5Ms === 'DNF' ? 'DNF' : formatTime(snap.ao5Ms);
  return snap;
}

function setFeedback(text, ttlMs = 3000) {
  feedbackEl.textContent = text;
  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => {
    feedbackEl.textContent = '';
  }, ttlMs);
}

function showQuickActions() {
  clearTimeout(quickActionTimeout);
  quickActionsEl.classList.remove('hidden');
  quickActionTimeout = setTimeout(() => {
    quickActionsEl.classList.add('hidden');
  }, 4500);
}

function saveAndRender() {
  const snap = updateStats();
  saveSession(snap);
  return snap;
}

function applyLastResult(result) {
  const updated = session.updateLastResult(result);
  if (!updated) {
    return;
  }

  timerDisplayEl.textContent = updated.result === 'DNF' ? 'DNF' : formatTime(updated.resultMs);
  saveAndRender();
}

function finalizeSolve(elapsedMs, inspectionElapsedMs) {
  const before = session.snapshot();
  const recorded = pendingPenalty === 'DNF' ? elapsedMs : pendingPenalty === '+2' ? elapsedMs + 2000 : elapsedMs;

  session.addSolve({
    scramble: activeScramble,
    rawMs: elapsedMs,
    resultMs: recorded,
    result: pendingPenalty,
    inspectionMs: inspectionElapsedMs,
    createdAt: Date.now(),
  });

  const after = saveAndRender();
  timerDisplayEl.textContent = pendingPenalty === 'DNF' ? 'DNF' : formatTime(recorded);

  const previous = before.lastSolve;
  const current = after.lastSolve;
  setFeedback(chooseMiniFeedback({
    solves: after.solves,
    current,
    previous,
    ao5Ms: after.ao5Ms,
    prevAo5Ms: before.ao5Ms,
    inspectionMs: inspectionElapsedMs,
  }));

  contextHintEl.textContent = chooseContextHint({
    solves: after.solves,
    meanMs: after.meanMs,
    ao5Ms: after.ao5Ms,
    bestAo5Ms: after.bestAo5Ms,
  });

  if (shouldSuggestBreak(after.solves.length)) {
    breakPromptEl.classList.remove('hidden');
  }

  showQuickActions();
  activeScramble = scrambleQueue.next();
  scrambleEl.textContent = activeScramble;
  pendingPenalty = 'OK';
  lastInspectionElapsedMs = 0;
}

function onPress() {
  if (isBreakMode) {
    return;
  }

  const event = timer.pressStart();
  if (event.type === 'inspection-started') {
    inspectionCues = new Set();
    timerWrapEl.dataset.inspectionStage = 'none';
    timerWrapEl.dataset.inspectionTone = 'calm';
    return;
  }

  if (event.type === 'stopped') {
    finalizeSolve(event.elapsedMs, lastInspectionElapsedMs);
  }
}

function onRelease() {
  const released = timer.releaseStart();
  if (released.type === 'solve-started') {
    pendingPenalty = released.penalty;
    lastInspectionElapsedMs = released.inspectionElapsedMs;
  }
}

function maybeVibrate(pattern) {
  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
}

function maybeEmitInspectionCue(elapsedMs) {
  if (elapsedMs >= 8000 && !inspectionCues.has(8)) {
    inspectionCues.add(8);
    timerWrapEl.dataset.inspectionStage = 'warn8';
    maybeVibrate(20);
    return;
  }

  if (elapsedMs >= 12000 && !inspectionCues.has(12)) {
    inspectionCues.add(12);
    timerWrapEl.dataset.inspectionStage = 'warn12';
    maybeVibrate([20, 50, 20]);
    return;
  }

  if (elapsedMs >= 15000 && !inspectionCues.has(15)) {
    inspectionCues.add(15);
    timerWrapEl.dataset.inspectionStage = 'warn15';
    maybeVibrate([30, 70, 30]);
  }
}

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.repeat) {
    return;
  }

  e.preventDefault();

  onPress();
});

window.addEventListener('keyup', (e) => {
  if (e.code !== 'Space') {
    return;
  }

  if (timer.getState() === 'inspection-holding') {
    onRelease();
  }
});

window.addEventListener('pointerdown', () => {
  onPress();
});

window.addEventListener('pointerup', () => {
  if (timer.getState() === 'inspection-holding') {
    onRelease();
  }
});

quickPlus2.addEventListener('click', () => {
  applyLastResult('+2');
  setFeedback('直前ソルブを +2 に修正', 2000);
});

quickDnf.addEventListener('click', () => {
  applyLastResult('DNF');
  setFeedback('直前ソルブを DNF に修正', 2000);
});

quickUndo.addEventListener('click', () => {
  const removed = session.undoLast();
  if (!removed) {
    return;
  }

  saveAndRender();
  setFeedback('直前ソルブを取り消し', 2000);
});

startBreakBtn.addEventListener('click', () => {
  isBreakMode = true;
  setFeedback('休憩中。再開するには画面をタップ', 5000);
  breakPromptEl.classList.add('hidden');
});

window.addEventListener('pointerdown', () => {
  if (!isBreakMode) {
    return;
  }

  isBreakMode = false;
  setFeedback('休憩を終了して再開', 2000);
});

resetButton.addEventListener('click', () => {
  if (!window.confirm('現在のセッションをリセットしますか？')) {
    return;
  }

  session.reset();
  clearSession();
  pendingPenalty = 'OK';
  timerDisplayEl.textContent = '0.00';
  activeScramble = scrambleQueue.next();
  scrambleEl.textContent = activeScramble;
  feedbackEl.textContent = '';
  contextHintEl.textContent = '';
  breakPromptEl.classList.add('hidden');
  quickActionsEl.classList.add('hidden');
  updateStats();
});

function updateStateUI() {
  const state = timer.getState();
  const isInspectionHolding = state === 'inspection-holding';
  const displayState = isInspectionHolding ? 'inspection' : state;
  timerWrapEl.dataset.state = displayState;

  if (state === 'inspection' || isInspectionHolding) {
    const elapsed = timer.getElapsedMs();
    maybeEmitInspectionCue(elapsed);
    const visual = getInspectionVisual(elapsed);
    const ready = timer.getReadyVisualState() === 'ready';
    timerWrapEl.dataset.inspectionTone = visual.tone;
    timerDisplayEl.textContent = (visual.remainingMs / 1000).toFixed(2);
    timerWrapEl.dataset.holdReady = isInspectionHolding && ready ? 'true' : 'false';
    stateTextEl.textContent = isInspectionHolding ? (ready ? 'READY!' : 'HOLD') : visual.text;
  } else if (state === 'solving') {
    timerDisplayEl.textContent = formatTime(timer.getElapsedMs());
    stateTextEl.textContent = 'SOLVING';
    timerWrapEl.dataset.inspectionStage = 'none';
    timerWrapEl.dataset.inspectionTone = 'none';
    timerWrapEl.dataset.holdReady = 'false';
  } else {
    stateTextEl.textContent = 'READY';
    timerWrapEl.dataset.inspectionStage = 'none';
    timerWrapEl.dataset.inspectionTone = 'none';
    timerWrapEl.dataset.holdReady = 'false';
  }
}

setInterval(updateStateUI, 30);
updateStats();
scrambleEl.textContent = activeScramble;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}
