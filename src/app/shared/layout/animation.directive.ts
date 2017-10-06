import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  OnInit
} from '@angular/core';
import { isNullOrEmpty } from '../../utilities';

@Directive({
  selector: '[animate]'
})

export class AnimateDirective implements OnInit {
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
    private _elementRef: ElementRef
  ) { }

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
    this._renderer.addClass(this._elementRef.nativeElement, this.trigger);
    this._endAnimation();
    this._endOutAnimation();
  }

  /**
   * Event that triggers when the animation is completed/ended
   */
  private _endAnimation(): void {
    if (isNullOrEmpty(this.trigger)) { return; }
    this._renderer.listen(this._elementRef.nativeElement, 'animationend', () => {
      if (!isNullOrEmpty(this.animate)) {
        this._renderer.removeClass(this._elementRef.nativeElement, this.animate);
      }
      this._renderer.removeClass(this._elementRef.nativeElement, this.trigger);
    });
  }

  /**
   * Event that triggers when the animation is completed/ended for those 'out' animation
   */
  private _endOutAnimation(): void {
    if (isNullOrEmpty(this.trigger)) { return; }
    if (this.trigger.includes('Out')) {
      this._renderer.listen(this._elementRef.nativeElement, 'animationend', () => {
        this._renderer.setStyle(this._elementRef.nativeElement, 'display', 'none');
      });
    }
  }
}
