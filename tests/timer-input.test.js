import test from 'node:test';
import assert from 'node:assert/strict';
import { bindTimerPointerInput, isInteractiveTarget, shouldHandleTimerKeyboardEvent } from '../src/timer-input.js';

function createInteractiveNode(matches) {
  return {
    closest(selector) {
      return matches ? { selector } : null;
    },
  };
}

function createTapArea() {
  const listeners = new Map();
  const captured = [];
  const released = [];

  return {
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type, handler) {
      if (listeners.get(type) === handler) {
        listeners.delete(type);
      }
    },
    setPointerCapture(pointerId) {
      captured.push(pointerId);
    },
    releasePointerCapture(pointerId) {
      released.push(pointerId);
    },
    dispatch(type, event) {
      const handler = listeners.get(type);
      if (handler) {
        handler(event);
      }
    },
    captured,
    released,
    listeners,
  };
}

test('isInteractiveTarget detects controls via closest', () => {
  assert.equal(isInteractiveTarget(createInteractiveNode(true)), true);
  assert.equal(isInteractiveTarget(createInteractiveNode(false)), false);
  assert.equal(isInteractiveTarget(null), false);
});

test('space key is ignored while interactive control is focused', () => {
  assert.equal(shouldHandleTimerKeyboardEvent({
    code: 'Space',
    repeat: false,
    target: createInteractiveNode(true),
  }), false);

  assert.equal(shouldHandleTimerKeyboardEvent({
    code: 'Space',
    repeat: false,
    target: createInteractiveNode(false),
  }), true);

  assert.equal(shouldHandleTimerKeyboardEvent({
    code: 'Enter',
    repeat: false,
    target: createInteractiveNode(false),
  }), false);
});

test('pointer input only presses in timer area and releases from holding state', () => {
  const tapArea = createTapArea();
  const calls = [];
  let timerState = 'idle';

  bindTimerPointerInput({
    tapAreaEl: tapArea,
    isBreakMode: () => false,
    resumeBreak: () => calls.push('resume'),
    onPress: () => {
      calls.push('press');
      timerState = 'inspection-holding';
    },
    onRelease: () => calls.push('release'),
    getTimerState: () => timerState,
  });

  tapArea.dispatch('pointerdown', { pointerId: 7 });
  tapArea.dispatch('pointerup', { pointerId: 7 });

  assert.deepEqual(calls, ['press', 'release']);
  assert.deepEqual(tapArea.captured, [7]);
  assert.deepEqual(tapArea.released, [7]);
});

test('pointer down during break mode resumes break without pressing timer', () => {
  const tapArea = createTapArea();
  const calls = [];

  bindTimerPointerInput({
    tapAreaEl: tapArea,
    isBreakMode: () => true,
    resumeBreak: () => calls.push('resume'),
    onPress: () => calls.push('press'),
    onRelease: () => calls.push('release'),
    getTimerState: () => 'idle',
  });

  tapArea.dispatch('pointerdown', { pointerId: 3 });
  tapArea.dispatch('pointerup', { pointerId: 3 });

  assert.deepEqual(calls, ['resume']);
});
