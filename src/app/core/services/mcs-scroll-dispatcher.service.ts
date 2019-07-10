import {
  Injectable,
  NgZone,
  ElementRef
} from '@angular/core';
import {
  Subject,
  Subscription,
  merge,
  fromEvent
} from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import { Scrollable } from '@app/shared';

const DEFAULT_SCROLL_TIME = 20;

@Injectable()
export class McsScrollDispatcherService {
  private _globalSubscription: Subscription;
  private _scrollableMap: Map<Scrollable, Subscription>;
  private _onScroll: Subject<any>;

  constructor(private _ngZone: NgZone) {
    this._onScroll = new Subject();
    this._scrollableMap = new Map<Scrollable, Subscription>();
  }

  /**
   * Registers a Scrollable with the service and listens for its scrolled events. When the
   * scrollable is scrolled, the service emits the event in its scrolled observable.
   * @param scrollable Scrollable instance to be registered.
   */
  public register(scrollable: Scrollable): void {
    if (isNullOrEmpty(scrollable)) { return; }
    let scrollableSubscription = scrollable.elementScrolled()
      .subscribe(() => this._notifyStream());

    this._scrollableMap.set(scrollable, scrollableSubscription);
  }

  /**
   * Deregisters a Scrollable reference and unsubscribes from its scroll event observable.
   * @param scrollable Scrollable instance to be deregistered.
   */
  public deregister(scrollable: Scrollable): void {
    if (isNullOrEmpty(scrollable)) { return; }
    let scrollableReference = this._scrollableMap.get(scrollable);

    if (scrollableReference) {
      scrollableReference.unsubscribe();
      this._scrollableMap.delete(scrollable);
    }
  }

  /**
   * Subscribes to an observable that emits an event whenever any of the registered Scrollable
   * references (or window, document, or body) fire a scrolled event.
   * @param auditTimeInMs Audit time to check the scroll is fired
   * @param callback Callback method to call when scroll is fired
   */
  public scrolled(auditTimeInMs: number = DEFAULT_SCROLL_TIME, callback: () => any): Subscription {

    // Register observable with delay call when specified
    let observable = auditTimeInMs > 0 ?
      auditTime.call(this._onScroll.asObservable(), auditTimeInMs) :
      this._onScroll.asObservable();

    // Register global subscription
    if (isNullOrEmpty(this._globalSubscription)) {
      this._globalSubscription = this._ngZone.runOutsideAngular(() => {
        return merge(
          fromEvent(window.document, 'scroll'),
          fromEvent(window, 'resize')
        ).subscribe(() => this._notifyStream());
      });
    }

    // Add final subscription listener in order to be able to remove the global
    // event listeners once there are no more subscriptions.
    let subscription = observable.subscribe(callback);
    subscription.add(() => {
      if (!isNullOrEmpty(this._globalSubscription) && !this._scrollableMap.size) {
        this._globalSubscription.unsubscribe();
        this._globalSubscription = null;
      }
    });
    return subscription;
  }

  /**
   * Returns all registered Scrollables that contain the provided element
   * @param elementRef Element Reference of the container
   */
  public getScrollContainers(elementRef: ElementRef | HTMLElement): Scrollable[] {
    let scrollingContainers: Scrollable[] = new Array();

    this._scrollableMap.forEach((_subscription: Subscription, _scrollable: Scrollable) => {
      if (this.scrollableContainsElement(_scrollable, elementRef)) {
        scrollingContainers.push(_scrollable);
      }
    });
    return scrollingContainers;
  }

  /**
   * Gets the scrollable parent container of the provided element
   * @param elementRef Element on where to obtain the scrollable parent container
   */
  public getScrollableParentContainer(elementRef: ElementRef | HTMLElement): Scrollable {
    let scrollableContainers = this.getScrollContainers(elementRef);
    return scrollableContainers && scrollableContainers[0];
  }

  /**
   * Returns the scrollable item based it's id
   */
  public getScrollableItemById(id: string): Scrollable {
    let scrollableItem: Scrollable;

    this._scrollableMap.forEach((_value, key) => {
      if (key.scrollbarId !== id) { return; }
      scrollableItem = key;
    });
    return scrollableItem;
  }

  /**
   * Returns all the registered scrollable items
   */
  public getScrollableItems(): Scrollable[] {
    return Array.from(this._scrollableMap.keys());
  }

  /**
   * Returns true if the element is contained within the provided Scrollable.
   * @param scrollable Scrollable information
   * @param elementRef Element Reference to check the scrollabe content
   */
  public scrollableContainsElement(
    scrollable: Scrollable,
    elementRef: ElementRef | HTMLElement
  ): boolean {
    let isExist: boolean = false;
    let element = elementRef instanceof HTMLElement ? elementRef : elementRef.nativeElement;
    let scrollableElement = scrollable.getElementRef().nativeElement;

    // Traverse through the element parents using forever loop until we reach null,
    // checking if any of the elements are the scrollable's element.
    for (; ;) {
      isExist = element === scrollableElement;
      if (isNullOrEmpty(element) || isExist) { break; }
      element = element.parentElement;
    }
    return isExist;
  }

  /**
   * Scroll element based on the given parameters
   * @param element Element to be scrolled
   * @param offset Addition offset of the scrolled element
   * @param duration Duration of the scrolling
   */
  public scrollToElement(
    element: HTMLElement,
    offset: number = 0,
    duration: number = 300
  ): void {
    if (isNullOrEmpty(element)) { return; }

    // Find the corresponding scrollable element of the given element
    let scrollableElement = this.getScrollableParentContainer(element);
    if (isNullOrEmpty(scrollableElement)) { return; }

    this._executeScrollingToElement(
      scrollableElement.getElementRef().nativeElement,
      element.offsetTop + (offset * -1), duration
    );
  }

  /**
   * Execute the scrolling to element by the given scrollable element
   * @param scrollableElement Scrollable element that serve as the based on the element to scroll
   * @param elementOffsetY Offset Y of the element to be scrolled
   * @param duration Duration of the scrolling
   */
  private _executeScrollingToElement(
    scrollableElement: HTMLElement,
    elementOffsetY: number,
    duration: number
  ) {
    let startingY = scrollableElement.scrollTop;
    let diff = elementOffsetY - startingY;
    let start;

    // Declare function pointer for calculating scroll
    let step = (timestamp: number) => {
      start = (!start) ? timestamp : start;

      const time = timestamp - start;
      let percent = Math.min(time / duration, 1);
      scrollableElement.scrollTop = startingY + diff * percent;
      if (time < duration) {
        window.requestAnimationFrame(step);
      }
    };
    setTimeout(() => {
      window.requestAnimationFrame(step);
    });
  }

  /**
   * Notify the scrolled stream
   */
  private _notifyStream(): void {
    this._onScroll.next();
  }
}
