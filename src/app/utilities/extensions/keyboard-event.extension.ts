import { KeyboardKey } from '../enumerations/keyboard-key';

declare global {
  interface KeyboardEvent {
    keyboardKey(): KeyboardKey;
  }
}

// Keyboard keycode was already deprecated, however, some browsers
// are still using that keyCode instead of key. So we just need to
// disabled the lint for it.
KeyboardEvent.prototype.keyboardKey = function () {
  // tslint:disable-next-line: deprecation
  return (this as KeyboardEvent).keyCode as KeyboardKey ||
    KeyboardKey[(this as KeyboardEvent).key];
}

export { };
