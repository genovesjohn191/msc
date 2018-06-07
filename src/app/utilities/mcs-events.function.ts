/** Callback type for the event */
type eventCallback = (_event: any) => any;

/**
 * This will register the event of the specific event type
 * @param nativeElement Native element to be registered in the event
 * @param eventName Event Nameof the event to be registered
 * @param callback Callbacks function to register in the event (it can be array)
 */
export function registerEvent(
  nativeElement: any,
  eventName: string,
  callbacks: eventCallback | eventCallback[]
): void {
  // Check event inputs and host element are not undefined
  if (!eventName || !nativeElement) { return undefined; }

  // Add the event listener of the host element
  if (Array.isArray(callbacks)) {
    callbacks.forEach((callback) => {
      nativeElement.addEventListener(eventName, callback);
    });
  } else {
    nativeElement.addEventListener(eventName, callbacks);
  }
}

/**
 * This will unregister the event of the specific event type
 *
 * @param nativeElement Native element to be registered in the event
 * @param eventName Event Nameof the event to be registered
 * @param callbacks Callbacks function to be removed (it can be array)
 */
export function unregisterEvent(
  nativeElement: any,
  eventName: string,
  callbacks: eventCallback | eventCallback[]
): void {
  // Check event and nativeElement parameters are not undefined
  if (!eventName || !nativeElement) { return undefined; }

  // Remove the event listener of the host element
  if (Array.isArray(callbacks)) {
    callbacks.forEach((callback) => {
      nativeElement.removeEventListener(eventName, callback);
    });
  } else {
    nativeElement.removeEventListener(eventName, callbacks);
  }
}

/**
 * This will trigger the assosiated event on the given element
 * @param nativeElement Native element to invoke the event
 * @param event Event Nameof the event to be triggered
 * @param _eventInit Event configuration
 */
export function triggerEvent(
  nativeElement: any,
  event: string | Event,
  _eventInit: EventInit = { cancelable: true }
): void {
  // Check event and nativeElement parameters are not undefined
  if (!event || !nativeElement) { return undefined; }

  // Remove the event listener of the host element
  if (event instanceof Event) {
    nativeElement.dispatchEvent(event);
  } else {
    let customEvent = document.createEvent('HTMLEvents');
    customEvent.initEvent(event, _eventInit.bubbles, _eventInit.cancelable);
    nativeElement.dispatchEvent(customEvent);
  }
}

/**
 * Create mouse event and use it to your trigger event
 * @param type Type of mouse event
 * @param x X-axis position of the mouse
 * @param y Y-axis position of the mouse
 *
 * `@Note:` Do not use this method to create event in your component,
 * this is for unit test only
 */
export function createMouseEvent(type: string, x = 0, y = 0) {
  let event = document.createEvent('MouseEvent');
  event.initMouseEvent(type,
    false, /* canBubble */
    false, /* cancelable */
    window, /* view */
    0, /* detail */
    x, /* screenX */
    y, /* screenY */
    x, /* clientX */
    y, /* clientY */
    false, /* ctrlKey */
    false, /* altKey */
    false, /* shiftKey */
    false, /* metaKey */
    0, /* button */
    null /* relatedTarget */);
  return event;
}

/**
 * Create keyboard event and use it to your trigger event
 * @param keyCode Keycode to be triggered
 * @param keyEvent Event type
 * @param target Target element where the event will attached
 * @param key Key to check the event
 *
 * `@Note:` Do not use this method to create event in your component,
 * this is for unit test only
 */
export function createKeyboardEvent(
  keyCode: number,
  keyEvent: string = 'keydown',
  target?: Element,
  key?: string
) {
  let event = document.createEvent('KeyboardEvent') as any;
  // Firefox does not support `initKeyboardEvent`, but supports `initKeyEvent`.
  let initEventFn = (event.initKeyEvent || event.initKeyboardEvent).bind(event);
  let originalPreventDefault = event.preventDefault;

  initEventFn(keyEvent, true, true, window, 0, 0, 0, 0, 0, keyCode);

  // Webkit Browsers don't set the keyCode when calling the init function.
  // See related bug https://bugs.webkit.org/show_bug.cgi?id=16735
  Object.defineProperties(event, {
    keyCode: { get: () => keyCode },
    key: { get: () => key },
    target: { get: () => target }
  });

  // IE won't set `defaultPrevented` on synthetic events so we need to do it manually.
  event.preventDefault = function() {
    Object.defineProperty(event, 'defaultPrevented', { get: () => true });
    return originalPreventDefault.apply(this, arguments);
  };
  return event;
}
