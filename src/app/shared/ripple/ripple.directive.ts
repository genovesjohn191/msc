import {
  Directive,
  Input,
  ElementRef,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { McsPlatformService } from '../../core';
import { RippleRenderer } from './factory/ripple-renderer';
import { RippleConfig } from './factory/ripple-config';

@Directive({
  selector: '[mcsRipple]',
  host: {
    'class': 'ripple-directive-wrapper'
  }
})

export class RippleDirective implements OnChanges, OnDestroy {
  @Input()
  public rippleCentered: boolean;

  @Input()
  public rippleColor: 'light' | 'dark';

  @Input()
  public rippleTrigger: HTMLElement;

  @Input()
  public rippleSpeedFactor: number;

  @Input()
  public rippleRadius: number = 0;

  @Input()
  public relativeParent: boolean = true;

  /**
   * Ripple renderer class instance
   */
  private _rippleRenderer: RippleRenderer;

  constructor(
    private _ngZone: NgZone,
    private _elementRef: ElementRef,
    private _platformService: McsPlatformService
  ) {
    // Instantiate the ripple renderer class
    this._rippleRenderer = new RippleRenderer(
      this._ngZone,
      this._elementRef,
      this._platformService
    );
    this._updateRippleRenderer();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // Change the trigger element during setting of input
    // By default, the trigger element is the host element
    if (changes['rippleTrigger'] && this.rippleTrigger) {
      this._rippleRenderer.setTriggerElement(this.rippleTrigger);
    }

    // Update the settings of the ripple renderer
    this._updateRippleRenderer();
  }

  public ngOnDestroy(): void {
    // Set the trigger element to null to cleanup all listeners.
    this._rippleRenderer.setTriggerElement(null);
  }

  /**
   * Fades out all currently showing ripple elements.
   */
  public fadeOutAll() {
    this._rippleRenderer.fadeOutAll();
  }

  /**
   * Return the ripple configuration based on input
   */
  public getRippleConfig(): RippleConfig {
    return {
      centered: this.rippleCentered,
      speedFactor: this.rippleSpeedFactor,
      radius: this.rippleRadius,
      color: this.rippleColor
    };
  }

  /**
   * Updates the ripple renderer configuration
   */
  private _updateRippleRenderer() {
    this._rippleRenderer.rippleConfig = this.getRippleConfig();
  }
}
