import {
  Injectable,
  NgZone,
  ElementRef
} from '@angular/core';
import {
  Subject,
  Subscription
} from 'rxjs/Rx';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { auditTime } from 'rxjs/operator/auditTime';
import { isNullOrEmpty } from '../../utilities';
import { McsScrollable } from '../interfaces/mcs-scrollable.interface';

const DEFAULT_SCROLL_TIME = 20;

@Injectable()
export class McsScrollDispatcherService {

  /** Subject for notifying that a registered scrollable reference element has been scrolled. */
  public scrolledStream: Subject<any>;

  // Other variables
  private _globalSubscription: Subscription;
  private _scrollableMap: Map<McsScrollable, Subscription>;

  constructor(private _ngZone: NgZone) {
    this.scrolledStream = new Subject();
    this._scrollableMap = new Map<McsScrollable, Subscription>();
  }

  /**
   * Registers a Scrollable with the service and listens for its scrolled events. When the
   * scrollable is scrolled, the service emits the event in its scrolled observable.
   * @param scrollable Scrollable instance to be registered.
   */
  public register(scrollable: McsScrollable): void {
    if (isNullOrEmpty(scrollable)) { return; }
    let scrollableSubscription = scrollable.elementScrolled()
      .subscribe(() => this._notifyStream());

    this._scrollableMap.set(scrollable, scrollableSubscription);
  }

  /**
   * Deregisters a Scrollable reference and unsubscribes from its scroll event observable.
   * @param scrollable Scrollable instance to be deregistered.
   */
  public deregister(scrollable: McsScrollable): void {
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
      auditTime.call(this.scrolledStream.asObservable(), auditTimeInMs) :
      this.scrolledStream.asObservable();

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
  public getScrollContainers(elementRef: ElementRef): McsScrollable[] {
    let scrollingContainers: McsScrollable[] = new Array();

    this._scrollableMap.forEach((_subscription: Subscription, _scrollable: McsScrollable) => {
      if (this.scrollableContainsElement(_scrollable, elementRef)) {
        scrollingContainers.push(_scrollable);
      }
    });
    return scrollingContainers;
  }

  /**
   * Returns true if the element is contained within the provided Scrollable.
   * @param scrollable Scrollable information
   * @param elementRef Element Reference to check the scrollabe content
   */
  public scrollableContainsElement(scrollable: McsScrollable, elementRef: ElementRef): boolean {
    let element = elementRef.nativeElement;
    let scrollableElement = scrollable.getElementRef().nativeElement;

    // Traverse through the element parents until we reach null, checking if any of the elements
    // are the scrollable's element.
    do {
      element = element.parentElement;
      if (element === scrollableElement) { return true; }
    } while (element);

    return false;
  }

  /**
   * Scroll element based on the given parameters
   * @param element Element to be scrolled
   * @param scrollableElementId Scrollable element that serve as the based on the element to scroll
   * @param offset Addition offset of the scrolled element
   * @param duration Duration of the scrolling
   */
  public scrollToElement(
    element: HTMLElement,
    scrollableElementId: string = 'page-content',
    offset: number = 0,
    duration: number = 500
  ): void {
    if (isNullOrEmpty(element)) { return; }

    // Get the element with scrollbar based on Id provided
    let scrollableElement: any;
    this._scrollableMap.forEach((_value, key) => {
      if (key.scrollbarId === scrollableElementId) {
        scrollableElement = key.getElementRef().nativeElement;
      }
    });
    // Execute scrolling of element
    this._executeScrollingToElement(scrollableElement, element.offsetTop + offset, duration);
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

    window.requestAnimationFrame(function step(timestamp) {
      start = (!start) ? timestamp : start;

      const time = timestamp - start;
      let percent = Math.min(time / duration, 1);

      scrollableElement.scrollTo(0, startingY + diff * percent);
      if (time < duration) {
        window.requestAnimationFrame(step);
      }
    });
  }

  /**
   * Notify the scrolled stream
   */
  private _notifyStream(): void {
    this.scrolledStream.next();
  }
}
