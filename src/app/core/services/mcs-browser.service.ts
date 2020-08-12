import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Breakpoint } from '@app/models';
import { CommonDefinition } from '@app/utilities';

@Injectable()
export class McsBrowserService {
  private _breakpointChange: BehaviorSubject<Breakpoint>;
  private _breakPoints: Map<Breakpoint, string>;

  constructor() {
    this._breakpointChange = new BehaviorSubject<Breakpoint>(Breakpoint.Large);
    this._breakPoints = new Map();
    this.initialize();
  }

  /**
   * Initialize stream and raise for resize event initially
   */
  public initialize() {
    // Creates the breakpoints table
    this._createBreakpoints();

    // Register the resize event
    window.addEventListener('resize', ($event) => {
      this.onResizeWindow($event);
    });

    // Invoke resize event during initialization to set the device type
    let event = document.createEvent('Event');
    event.initEvent('resize', false, true);
    window.dispatchEvent(event);
  }

  /**
   * Event that emits when the breakpoint changes
   */
  public breakpointChange(): Observable<Breakpoint> {
    return this._breakpointChange.pipe(
      distinctUntilChanged()
    );
  }

  /**
   * This event will invoke when the window/browser size is changed
   * @param _event Resize event properties
   */
  public onResizeWindow(_event: any): void {
    let largestBreakpoint: Breakpoint;

    this._breakPoints.forEach((breakpointValue, breakpointKey) => {
      let breakpointMatched = window.matchMedia(breakpointValue).matches;
      if (breakpointMatched) {
        largestBreakpoint = breakpointKey;
      }
    });
    this._breakpointChange.next(largestBreakpoint);
  }

  /**
   * This event for scrolling page back to top
   */
  public scrollToTop(): void {
    return window.scrollTo(0, 0);
  }

  /**
   * Creates breakpoints table
   */
  private _createBreakpoints(): void {
    this._breakPoints.set(Breakpoint.XSmall, `(min-width: ${CommonDefinition.BREAKPOINT_XSMALL}px)`);
    this._breakPoints.set(Breakpoint.Small, `(min-width: ${CommonDefinition.BREAKPOINT_SMALL}px)`);
    this._breakPoints.set(Breakpoint.Medium, `(min-width: ${CommonDefinition.BREAKPOINT_MEDIUM}px)`);
    this._breakPoints.set(Breakpoint.Large, `(min-width: ${CommonDefinition.BREAKPOINT_LARGE}px)`);
    this._breakPoints.set(Breakpoint.Wide, `(min-width: ${CommonDefinition.BREAKPOINT_WIDE}px)`);
  }
}
