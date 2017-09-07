
type eventType = 'click' | 'mouseenter' | 'mouseleave' | 'touchstart' | 'scroll';

/**
 * This will register the event of the specific event type
 *
 * `@Note` Angular Hostlistener was not used instead of this
 * because of IOS issues
 * @param renderer Angular renderer to be use
 * @param nativeElement Native element to be registered in the event
 * @param event Event type
 * @param callback Callback function to register in the event
 */
export function registerEvent(
  renderer: any,
  nativeElement: any,
  event: eventType,
  callback: (event: any) => boolean | void
): void {
  // Check renderer and event inputs are not undefined
  if (!renderer || !event || !nativeElement) { return undefined; }

  // Register event in angular renderer
  renderer.listen(nativeElement, event, callback);
}

/**
 * This will unregister the event of the specific event type
 *
 * @param nativeElement Native element to be registered in the event
 * @param event Event type
 * @param callback Callback function to be removed
 */
export function unregisterEvent(
  nativeElement: any,
  event: eventType,
  callback: (event: any) => boolean | void
): void {
  // Check event and nativeElement parameters are not undefined
  if (!event || !nativeElement) { return undefined; }

  // Unregister event using removeEventListener
  // because angular renderer don't have own unregister method
  nativeElement.removeEventListener(event, callback);
}
