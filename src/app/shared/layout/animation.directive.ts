import {
  Directive,
  Input,
  Output,
  Renderer2,
  ElementRef,
  EventEmitter,
  OnInit,
  NgZone
} from '@angular/core';
import {
  isNullOrEmpty,
  registerEvent,
  unregisterEvent
} from '@app/utilities';

@Directive({
  selector: '[animate]'
})

export class AnimateDirective implements OnInit {

  @Output()
  public animationEnd: EventEmitter<any>;

  /**
   * Animate to be set in the host element
   */
  @Input()
  public get animate(): string {
    return this._animate;
  }
  public set animate(value: string) {
    if (this._animate !== value) {
      this._animate = value;
    }
  }
  private _animate: string;

  /**
   * Event handler references
   */
  private _endAnimationHandler = this._endAnimationCallback.bind(this);
  private _endOutAnimationHandler = this._endOutAnimationCallback.bind(this);

  /**
   * Type of animation to be triggered
   */
  @Input()
  public get trigger(): string {
    return this._trigger;
  }
  public set trigger(value: string) {
    if (this._trigger !== value) {
      this._trigger = value;
      this._triggerAnimation();
    }
  }
  private _trigger: string;

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _ngZone: NgZone
  ) {
    this.animationEnd = new EventEmitter();
  }

  public ngOnInit() {
    this._setAnimation();
  }

  /**
   * Set the animation on the host element
   */
  private _setAnimation(): void {
    this._renderer.addClass(this._elementRef.nativeElement, `animation`);
    if (!isNullOrEmpty(this.animate)) {
      this._renderer.addClass(this._elementRef.nativeElement, this.animate);
    }
  }

  /**
   * Trigger the animation by adding the class of the corresponding animation
   */
  private _triggerAnimation(): void {
    if (isNullOrEmpty(this.trigger)) { return; }

    // Set the actual display of the host element
    // since out animations are setting the display to none of host element
    this._renderer.removeClass(this._elementRef.nativeElement, 'out-end');
    this._renderer.addClass(this._elementRef.nativeElement, this.trigger);

    // Register animation end callbacks
    this._endAnimation();
    this._endOutAnimation();
  }

  /**
   * Event that triggers when the animation is completed/ended
   */
  private _endAnimation(): void {
    if (isNullOrEmpty(this.trigger)) { return; }
    registerEvent(this._elementRef.nativeElement, 'animationend', this._endAnimationHandler);
  }

  /**
   * End animation callback
   *
   * `@Note`: This will also unregister the event callback once it was already called
   */
  private _endAnimationCallback(): void {
    if (!isNullOrEmpty(this.animate)) {
      this._renderer.removeClass(this._elementRef.nativeElement, this.animate);
    }
    this._renderer.removeClass(this._elementRef.nativeElement, this.trigger);
    this.animationEnd.emit();

    this._ngZone.runOutsideAngular(() => {
      unregisterEvent(this._elementRef.nativeElement, 'animationend', this._endAnimationHandler);
    });
  }

  /**
   * Event that triggers when the animation is completed/ended for those 'out' animation
   */
  private _endOutAnimation(): void {
    if (isNullOrEmpty(this.trigger)) { return; }
    if (this.trigger.includes('Out')) {
      registerEvent(this._elementRef.nativeElement, 'animationend', this._endOutAnimationHandler);
    }
  }

  /**
   * End out animation callback
   *
   * `@Note`: This will also unregister the event callback once it was already called
   */
  private _endOutAnimationCallback(): void {
    this._renderer.addClass(this._elementRef.nativeElement, 'out-end');
    this._ngZone.runOutsideAngular(() => {
      unregisterEvent(this._elementRef.nativeElement, 'animationend', this._endOutAnimationHandler);
    });
  }
}
