const INTERACTIVE_SELECTOR = [
  'button',
  'input',
  'textarea',
  'select',
  'option',
  'a[href]',
  '[role="button"]',
  '[contenteditable="true"]',
].join(', ');

export function isInteractiveTarget(target) {
  return Boolean(target && typeof target.closest === 'function' && target.closest(INTERACTIVE_SELECTOR));
}

export function shouldHandleTimerKeyboardEvent(event) {
  if (event.code !== 'Space' || event.repeat) {
    return false;
  }

  return !isInteractiveTarget(event.target);
}

export function bindTimerPointerInput({
  tapAreaEl,
  isBreakMode,
  resumeBreak,
  onPress,
  onRelease,
  getTimerState,
}) {
  function handlePointerDown(event) {
    if (typeof tapAreaEl.setPointerCapture === 'function' && event.pointerId !== undefined) {
      tapAreaEl.setPointerCapture(event.pointerId);
    }

    if (isBreakMode()) {
      resumeBreak();
      return;
    }

    onPress();
  }

  function handlePointerUp(event) {
    if (typeof tapAreaEl.releasePointerCapture === 'function' && event.pointerId !== undefined) {
      tapAreaEl.releasePointerCapture(event.pointerId);
    }

    if (getTimerState() === 'inspection-holding') {
      onRelease();
    }
  }

  tapAreaEl.addEventListener('pointerdown', handlePointerDown);
  tapAreaEl.addEventListener('pointerup', handlePointerUp);

  return () => {
    tapAreaEl.removeEventListener('pointerdown', handlePointerDown);
    tapAreaEl.removeEventListener('pointerup', handlePointerUp);
  };
}
