import {
  Component,
  Input,
  OnInit,
  Renderer2,
  ElementRef,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges
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
    '[class.button-active]': 'active'
  }
})

export class ButtonComponent implements OnInit, OnChanges {
  @Input('mcsButton')
  public type: ButtonType = 'raised';

  @Input()
  public arrow: 'up' | 'right';

  @Input()
  public labelPlacement: McsPlacementType = 'center';

  @Input()
  public size: string;

  @Input()
  public color: McsStatusColorType;

  @Input()
  public get active(): boolean { return this._active; }
  public set active(value: boolean) { this._active = coerceBoolean(value); }
  private _active: boolean;

  @Input()
  public get disabled(): boolean { return this._disabled; }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

  @Input()
  public get disabledRipple(): boolean { return this._disabledRipple; }
  public set disabledRipple(value: boolean) { this._disabledRipple = coerceBoolean(value); }
  private _disabledRipple: boolean = false;

  constructor(
    protected _renderer: Renderer2,
    protected _elementRef: ElementRef,
    protected _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this._initializeType();
    this._initializeColorByType();
    this._setType(this.type);
    this._setPlacement(this.labelPlacement);
    this._setSize(this.size);
    this._setColor(this.color);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let typeChanged = changes['type'];
    if (!isNullOrEmpty(typeChanged)) {
      this._setType(this.type);
    }

    let placementChanged = changes['labelPlacement'];
    if (!isNullOrEmpty(placementChanged)) {
      this._setPlacement(this.labelPlacement);
    }

    let sizeChanged = changes['size'];
    if (!isNullOrEmpty(sizeChanged)) {
      this._setSize(this.size);
    }

    let colorChanged = changes['color'];
    if (!isNullOrEmpty(colorChanged)) {
      this._setColor(this.color);
    }
  }

  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Returns the arrow icon key
   */
  public get arrowIconKey(): string {
    return this.arrow === 'right' ?
      CoreDefinition.ASSETS_SVG_ARROW_RIGHT_WHITE :
      CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  /**
   * Returns true when the button type is icon
   */
  public get isIconType(): boolean {
    return this.type === 'icon';
  }

  /**
   * Focuses the button element
   */
  public focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /**
   * Initializes the type of the button
   */
  private _initializeType(): void {
    this.type = isNullOrEmpty(this.type) ? 'raised' : this.type;
  }

  /**
   * Initializes the color based on the button type
   */
  private _initializeColorByType(): void {
    if (!isNullOrEmpty(this.color)) { return; }
    this.color = this.type === 'raised' ? 'primary' : 'default';
  }

  /**
   * Sets the type of the button
   * @param type Type of the button to be set
   */
  private _setType(type: string): void {
    if (isNullOrEmpty(type)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, this.type);
  }

  /**
   * Sets the size of the button (small, medium, large)
   * @param size Size of the button to be set
   */
  private _setSize(size: string): void {
    if (isNullOrEmpty(size)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, this.size);
  }

  /**
   * Sets the color of the button
   * @param color Color of the button to be set
   */
  private _setColor(color: string): void {
    if (isNullOrEmpty(color)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, color);
  }

  /**
   * Sets the label placement of the button
   * @param alignment Label placement
   */
  private _setPlacement(alignment: McsPlacementType): void {
    if (isNullOrEmpty(alignment)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, `label-placement-${alignment}`);
  }
}
