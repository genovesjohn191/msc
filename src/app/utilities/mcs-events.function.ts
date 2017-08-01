
type eventType = 'click' | 'mouseenter' | 'mouseleave';

/**
 * This will register the event of the specifiec event type
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
