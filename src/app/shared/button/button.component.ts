import {
  Component,
  Input,
  Renderer2,
  ElementRef,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { CoreDefinition } from '@app/core';
import {
  isNullOrEmpty,
  coerceBoolean,
  McsStatusColorType,
  McsPlacementType
} from '@app/utilities';

export type ButtonType =
  'basic' |
  'raised' |
  'icon';

@Component({
  selector: `button[mcsButtonIcon], button[mcsButtonRaised], button[mcsButton]`,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'button-wrapper',
    '[class.primary]': 'color === "primary"',
    '[class.raised]': 'type === "raised"',
    '[class.basic]': 'type === "basic"',
    '[class.label-placement-left]': 'labelPlacement === "left"',
    '[class.label-placement-center]': 'labelPlacement === "center"',
    '[class.label-placement-right]': 'labelPlacement === "right"',
    '[class.button-disabled]': 'disabled'
  }
})

export class ButtonComponent {
  @Input()
  public arrow: 'up' | 'right';

  @Input()
  public labelPlacement: McsPlacementType = 'center';

  @Input('mcsButton')
  public get type(): ButtonType { return this._type; }
  public set type(value: ButtonType) {
    this._type = value || 'raised';
  }
  private _type: ButtonType = 'raised';

  @Input()
  public get color(): McsStatusColorType { return this._color; }
  public set color(value: McsStatusColorType) {
    this._color = value;
    this._setColor(this.color);
  }
  private _color: McsStatusColorType = 'primary';

  @Input()
  public set size(value: string) {
    this._setSize(value);
  }

  @Input()
  public get disabled(): boolean { return this._disabled; }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

  @Input()
  public get disabledRipple(): boolean { return this._disabledRipple; }
  public set disabledRipple(value: boolean) { this._disabledRipple = coerceBoolean(value); }
  private _disabledRipple: boolean = false;

  /**
   * Returns the arrow icon key
   */
  public get arrowIconKey(): string {
    return this.arrow === 'right' ?
      CoreDefinition.ASSETS_SVG_ARROW_RIGHT_WHITE :
      CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  constructor(
    protected _renderer: Renderer2,
    protected _elementRef: ElementRef,
    protected _changeDetectorRef: ChangeDetectorRef
  ) { }

  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Focuses the button element
   */
  public focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /**
   * Sets the size of the button (small, medium, large)
   * @param size Size of the button to be set
   */
  private _setSize(size: string): void {
    if (isNullOrEmpty(size)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, size);
  }

  /**
   * Sets the color of the button
   * @param color Color of the button to be set
   */
  private _setColor(color: string): void {
    if (isNullOrEmpty(color)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, color);
  }
}
