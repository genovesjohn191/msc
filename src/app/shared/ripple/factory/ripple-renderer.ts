import {
  ElementRef,
  NgZone
} from '@angular/core';
import { RippleConfig } from './ripple-config';
import { RippleRef } from './ripple-ref';
import { RippleState } from './ripple-state.enum';
import { isNullOrEmpty } from '@app/utilities';
import { McsPlatformService } from '@app/core';

/** Fade in and out duration constants */
export const RIPPLE_FADE_IN_DURATION = 450;
export const RIPPLE_FADE_OUT_DURATION = 400;

export class RippleRenderer {

  public rippleConfig: RippleConfig = {};

  // Other variables
  private _containerElement: HTMLElement;
  private _isMousedown: boolean = false;
  private _triggerElement: HTMLElement | null;
  private _triggerEvents = new Map<string, any>();
  private _activeRipples = new Set<RippleRef>();

  constructor(
    private _ngZone: NgZone,
    private _elementRef: ElementRef,
    private _platformService: McsPlatformService
  ) {
    // Set container element to set the ripple
    if (this._platformService.isBrowser) {
      this._containerElement = this._elementRef.nativeElement;

      // Specify events which need to be registered on the trigger.
      this._triggerEvents.set('mousedown', this.onMousedown.bind(this));
      this._triggerEvents.set('mouseup', this.onMouseup.bind(this));
      this._triggerEvents.set('mouseleave', this.onMouseLeave.bind(this));

      // By default use the host element as trigger element.
      this.setTriggerElement(this._containerElement);
    }
  }

  /**
   * Sets the trigger element and registers the mouse events.
   * @param element Target element to assign the ripple
   */
  public setTriggerElement(element: HTMLElement | null) {
    // Remove all previously register event listeners from the trigger element.
    if (this._triggerElement) {
      this._triggerEvents.forEach((fn, type) => {
        this._triggerElement!.removeEventListener(type, fn);
      });
    }

    if (element) {
      this._ngZone.runOutsideAngular(() => {
        this._triggerEvents.forEach((fn, type) => element.addEventListener(type, fn));
      });
    }
    this._triggerElement = element;
  }

  /**
   * Fades in a ripple at the given coordinates.
   * @param pageX Offset PageX of the element
   * @param pageY Offset PageY of the element
   * @param config Ripple configuration
   */
  public fadeInRipple(pageX: number, pageY: number, config: RippleConfig = {}): RippleRef {
    let containerRect = this._containerElement.getBoundingClientRect();

    // Set the pageX and pageY offset in case of centered ripple
    if (config.centered) {
      pageX = containerRect.left + containerRect.width / 2;
      pageY = containerRect.top + containerRect.height / 2;
    }

    let radius = config.radius || this._distanceToFurthestCorner(pageX, pageY, containerRect);
    let duration = RIPPLE_FADE_IN_DURATION * (1 / (config.speedFactor || 1));
    let offsetX = pageX - containerRect.left;
    let offsetY = pageY - containerRect.top;

    let ripple = document.createElement('div');
    ripple.classList.add('ripple-element');

    ripple.style.left = `${offsetX - radius}px`;
    ripple.style.top = `${offsetY - radius}px`;
    ripple.style.height = `${radius * 2}px`;
    ripple.style.width = `${radius * 2}px`;

    // Set the color of the ripple based on input
    if (!isNullOrEmpty(config.color)) {
      ripple.classList.add(config.color);
    }
    ripple.style.transitionDuration = `${duration}ms`;

    this._containerElement.appendChild(ripple);

    // By default the browser does not recalculate the styles of dynamically created
    // ripple elements. This is critical because then the `scale` would not animate properly.
    this._getElementOpacity(ripple);
    ripple.style.transform = 'scale(1)';

    // Exposed reference to the ripple that will be returned.
    let rippleRef = new RippleRef(this, ripple, config);
    rippleRef.state = RippleState.FadingIn;
    this._activeRipples.add(rippleRef);

    // Wait for the ripple element to be completely faded in.
    // Once it's faded in, the ripple can be hidden immediately if the mouse is released.
    this.runTimeoutOutsideZone(() => {
      rippleRef.state = RippleState.Visible;
      if (!config.persistent && !this._isMousedown) {
        rippleRef.fadeOut();
      }
    }, duration);
    return rippleRef;
  }

  /**
   * Fades out a ripple reference.
   * @param rippleRef Ripple reference
   */
  public fadeOutRipple(rippleRef: RippleRef) {
    // For ripples that are not active anymore, don't re-un the fade-out animation.
    if (!this._activeRipples.delete(rippleRef)) {
      return;
    }
    let rippleEl = rippleRef.element;
    rippleEl.style.transitionDuration = `${RIPPLE_FADE_OUT_DURATION}ms`;
    rippleEl.style.opacity = '0';
    rippleRef.state = RippleState.FadingOut;

    // Once the ripple faded out, the ripple can be safely removed from the DOM.
    this.runTimeoutOutsideZone(() => {
      rippleRef.state = RippleState.Hidden;
      rippleEl.parentNode!.removeChild(rippleEl);
    }, RIPPLE_FADE_OUT_DURATION);
  }

  /**
   * Fades out all currently active ripples.
   */
  public fadeOutAll() {
    this._activeRipples.forEach((ripple) => ripple.fadeOut());
  }

  /**
   * Listener being called on mousedown event.
   * @param event Event operation for mouse
   */
  private onMousedown(event: MouseEvent) {
    this._isMousedown = true;
    this.fadeInRipple(event.pageX, event.pageY, this.rippleConfig);
  }

  /**
   * Listener being called on mouseup event.
   */
  private onMouseup() {
    this._isMousedown = false;

    // Fade-out all ripples that are completely visible and not persistent.
    this._activeRipples.forEach((ripple) => {
      if (!ripple.config.persistent && ripple.state === RippleState.Visible) {
        ripple.fadeOut();
      }
    });
  }

  /**
   * Listener being called on mouseleave event.
   */
  private onMouseLeave() {
    if (this._isMousedown) {
      this.onMouseup();
    }
  }

  /**
   * Calculate the distance between 2 points
   * @param x X axis of the element
   * @param y Y axis of the element
   * @param rect Rectangular figure of the element
   */
  private _distanceToFurthestCorner(x: number, y: number, rect: ClientRect) {
    const distX = Math.max(Math.abs(x - rect.left), Math.abs(x - rect.right));
    const distY = Math.max(Math.abs(y - rect.top), Math.abs(y - rect.bottom));
    return Math.sqrt(distX * distX + distY * distY);
  }

  /**
   * Enforce the style calculation of the given element
   * @param element Element to get the computed style
   */
  private _getElementOpacity(element: HTMLElement) {
    window.getComputedStyle(element).getPropertyValue('opacity');
  }

  /**
   * Angular outside zone execution
   * @param fn Function to be executed
   * @param delay Delay of the function to execute
   */
  private runTimeoutOutsideZone(fn: any, delay = 0) {
    this._ngZone.runOutsideAngular(() => setTimeout(fn, delay));
  }
}
