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
  coerceBoolean
} from '@app/utilities';

@Component({
  selector: `button[mcsButtonIcon], button[mcsButtonRaised], button[mcsButton]`,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'button-wrapper',
    '[attr.id]': 'id',
    '[class.primary]': 'color === "primary"',
    '[class.raised]': 'type === "raised"',
    '[class.button-disabled]': 'disabled'
  }
})

export class ButtonComponent {
  @Input()
  public id: string;

  @Input()
  public arrow: 'up' | 'right';

  @Input()
  public get color(): string { return this._color; }
  public set color(value: string) {
    this._color = value;
    this._setColor(this.color);
    this._changeDetectorRef.markForCheck();
  }
  private _color: string = 'primary';

  @Input()
  public get type(): any { return this._type; }
  public set type(value: any) {
    this._type = value;
    this._setType(value);
    this._changeDetectorRef.markForCheck();
  }
  private _type: 'raised' | 'basic' = 'raised';

  @Input()
  public set size(value: string) {
    this._setSize(value);
    this._changeDetectorRef.markForCheck();
  }

  @Input()
  public get disabled(): boolean { return this._disabled; }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

  @Input()
  public get disabledRipple(): boolean { return this._disabledRipple; }
  public set disabledRipple(value: boolean) { this._disabledRipple = coerceBoolean(value); }
  private _disabledRipple: boolean = false;

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

  public focus(): void {
    this._elementRef.nativeElement.focus();
  }

  private _setSize(size: string): void {
    if (isNullOrEmpty(size)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, size);
  }

  private _setColor(color: string): void {
    if (isNullOrEmpty(color)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, color);
  }

  private _setType(type: any): void {
    if (isNullOrEmpty(type)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, type);
  }
}
