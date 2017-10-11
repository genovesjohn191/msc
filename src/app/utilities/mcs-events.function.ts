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
 * @param eventName Event Nameof the event to be triggered
 * @param _eventInit Event configuration
 */
export function triggerEvent(
  nativeElement: any,
  eventName: string,
  _eventInit: EventInit = { cancelable: true }
): void {
  // Check event and nativeElement parameters are not undefined
  if (!eventName || !nativeElement) { return undefined; }

  // Remove the event listener of the host element
  nativeElement.dispatchEvent(
    new Event(eventName, _eventInit)
  );
}
