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
  animateFactory,
  isNullOrEmpty,
  CommonDefinition,
  coerceBoolean
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
  public iconStatusKey: string;

  @Input()
  public header: string;

  @Input()
  public get type(): McsStatusType { return this._type; }
  public set type(value: McsStatusType) {
    if (value !== this._type) {
      this._type = value;
      this._setIconStatusKeyByType();
      this._changeDetectorRef.markForCheck();
    }
  }

  @Input()
  public get hideIcon(): boolean { return this._hideIcon; }
  public set hideIcon(value: boolean) {
    this._hideIcon = coerceBoolean(value);
  }

  private _hideIcon: boolean;
  private _type: McsStatusType;

  /**
   * Returns the host class based on its type
   */
  public get hostClass(): string {
    return `${this._type} alert-wrapper`;
  }

  private _iconTableMap: Map<McsStatusType, string>;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) {
    this._createIconTable();
  }

  /**
   * Returns the close icon key
   */
  public get closeIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOSE_BLACK;
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

  /**
   * Creates the icon key table
   */
  private _setIconStatusKeyByType(): void {
    let iconKey = this._iconTableMap.get(this.type);
    this.iconStatusKey = iconKey || CoreDefinition.ASSETS_SVG_INFO;
  }

  /**
   * Creates the icon table map
   */
  private _createIconTable(): void {
    if (!isNullOrEmpty(this._iconTableMap)) { return; }
    this._iconTableMap = new Map<McsStatusType, string>();
    this._iconTableMap.set('error', CoreDefinition.ASSETS_SVG_ERROR);
    this._iconTableMap.set('warning', CoreDefinition.ASSETS_SVG_WARNING);
    this._iconTableMap.set('info', CoreDefinition.ASSETS_SVG_INFO);
    this._iconTableMap.set('success', CoreDefinition.ASSETS_SVG_SUCCESS);
  }
}
