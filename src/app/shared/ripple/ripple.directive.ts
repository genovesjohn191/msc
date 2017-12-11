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
import {
  coerceBoolean,
  coerceNumber
} from '../../utilities';

@Directive({
  selector: '[mcsRipple]',
  host: {
    'class': 'ripple-directive-wrapper'
  }
})

export class RippleDirective implements OnChanges, OnDestroy {
  @Input()
  public rippleColor: 'light' | 'dark';

  @Input()
  public rippleTrigger: HTMLElement;

  @Input()
  public get rippleCentered(): boolean { return this._rippleCentered; }
  public set rippleCentered(value: boolean) { this._rippleCentered = coerceBoolean(value); }
  private _rippleCentered: boolean;

  @Input()
  public get rippleSpeedFactor(): number { return this._rippleSpeedFactor; }
  public set rippleSpeedFactor(value: number) { this._rippleSpeedFactor = coerceNumber(value); }
  private _rippleSpeedFactor: number;

  @Input()
  public get rippleRadius(): number { return this._rippleRadius; }
  public set rippleRadius(value: number) { this._rippleRadius = coerceNumber(value); }
  private _rippleRadius: number = 0;

  @Input()
  public get relativeParent(): boolean { return this._relativeParent; }
  public set relativeParent(value: boolean) { this._relativeParent = coerceBoolean(value); }
  private _relativeParent: boolean = true;

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
