import {
  Component,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  Renderer2
} from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { CoreDefinition } from '@app/core';
import {
  McsStatusType,
  McsColorType,
  animateFactory
} from '@app/utilities';

@Component({
  selector: 'mcs-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.fadeIn,
    animateFactory.transformVertical
  ],
  host: {
    '[class]': 'hostClass',
    '[@transformVertical]': 'animationState',
    '(@transformVertical.done)': 'animationDone($event)'
  }
})

export class AlertComponent {
  public animationState = 'transform';

  @Input()
  public header: string;

  @Input()
  public get type(): McsStatusType { return this._type; }
  public set type(value: McsStatusType) {
    if (value !== this._type) {
      this._type = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _type: McsStatusType = 'success';

  /**
   * Returns the host class based on its type
   */
  public get hostClass(): string {
    return `${this._type} alert-wrapper`;
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) { }

  /**
   * Returns the alert icon key and color based on status
   */
  public get alertIconDetails(): { key, iconColor } {
    let _iconKey: string;
    let _iconColor: McsColorType;

    switch (this.type) {
      case 'error':
        _iconKey = CoreDefinition.ASSETS_FONT_CLOSE_CIRCLE;
        _iconColor = 'red';
        break;
      case 'warning':
        _iconKey = CoreDefinition.ASSETS_FONT_WARNING;
        _iconColor = 'red';
        break;
      case 'info':
        _iconKey = CoreDefinition.ASSETS_FONT_INFORMATION_CIRCLE;
        _iconColor = 'primary';
        break;
      case 'success':
      default:
        _iconKey = CoreDefinition.ASSETS_FONT_CHECK_CIRCLE;
        _iconColor = 'green';
        break;
    }
    return { key: _iconKey, iconColor: _iconColor };
  }

  /**
   * Hide the alert component
   */
  public hideAlert(): void {
    this.animationState = 'void';
  }

  /**
   * Event that emits when the animation was done
   * @param event Event animation provider
   */
  public animationDone(event: AnimationEvent): void {
    if (event.toState !== 'void') { return; }
    let hostElement = this._elementRef.nativeElement as HTMLElement;
    this._renderer.removeChild(hostElement.parentNode, hostElement);
  }
}
