/**
 * Refresh view after executing the method inside the function pointer
 * @param predicate Function pointer to be execute before refreshing the view
 * @param refreshTime Refresh time
 */
export function refreshView(predicate: () => void, refreshTime?: number) {
  // Set default refresh time if its not inputted
  if (!refreshTime) { refreshTime = 0; }

  // Settime out to process the function pointer into separate thread
  // or outside the angular zone so that when it came back to angular
  // the change detection will triggered
  setTimeout(() => { predicate(); }, refreshTime);
}
