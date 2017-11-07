import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Renderer2,
  ElementRef,
  ViewChild,
  forwardRef,
  HostBinding
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
/** Providers */
import {
  CoreDefinition,
  McsLoader
} from '../../core';

@Component({
  selector: 'mcs-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextboxComponent),
      multi: true
    }
  ],
  host: {
    '[attr.tabindex]': '0',
  }
})

export class TextboxComponent
  implements OnInit, AfterViewInit, ControlValueAccessor, McsLoader {
  public iconKey: string;

  @Input()
  public valid: boolean;

  @Input()
  public inputType: 'text' | 'number' | 'password';

  @Input()
  public get icon(): 'normal' | 'search' | 'loading' | 'caret-down' {
    return this._icon;
  }
  public set icon(value: 'normal' | 'search' | 'loading' | 'caret-down') {
    if (this._icon !== value) {
      this._icon = value;
      this._setIconKeyAndType(value);
    }
  }

  @Input()
  public get suffix(): string {
    return this._suffix;
  }
  public set suffix(value: string) {
    if (this._suffix !== value) {
      this._suffix = value;
    }
  }

  @Input()
  public name: string;

  @Input()
  public placeholder: string;

  @Input()
  public borderColor: string;

  @Input()
  public readonly: boolean;

  @Input()
  public disabled: boolean;

  @Input()
  @HostBinding('style.max-width')
  public width: string;

  @ViewChild('mcsTextbox')
  public mcsTextbox: ElementRef;

  /**
   * Model Binding Property
   */
  private _value: string;
  private _icon: 'normal' | 'search' | 'loading' | 'caret-down';
  private _suffix: string;

  public get value(): string {
    return this._value;
  }
  public set value(value: string) {
    if (value !== this._value) {
      this._value = value;
      if (this._onChanged) {
        this._onChanged(value);
      }
    }
  }

  public constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.inputType = 'text';
    this.valid = true;
    this.disabled = false;
  }

  public hasSuffix(): boolean {
    return this._suffix !== undefined;
  }

  public ngOnInit() {
    this._setIconKeyAndType(this.icon);
  }

  public ngAfterViewInit() {
    if (this.width) {
      this._renderer.addClass(this.mcsTextbox.nativeElement, 'w-100');
    }

    if (this.borderColor) {
      this._renderer.addClass(this.mcsTextbox.nativeElement, this.borderColor);
    }
  }

  public onFocus(_event): void {
    this._renderer.addClass(this.mcsTextbox.nativeElement, 'active');
  }

  public onFocusOut(_event): void {
    this._renderer.removeClass(this.mcsTextbox.nativeElement, 'active');
  }

  public focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    this._value = value;
  }

  /**
   * On Change Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnChange(fn: any) {
    this._onChanged = fn;
  }

  /**
   * On Touched Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnTouched(fn: any) {
    this._onTouched = fn;
  }

  /**
   * Event for the blur of the textbox itself to reflect the
   * status of _touched in the input property
   */
  public onTouched(_event: any) {
    this._onTouched();
  }

  public showLoader(): void {
    this.iconKey = CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public hideLoader(): void {
    this.iconKey = this.icon;
  }

  private _onChanged: (value: any) => void = () => { /** dummy */ };
  private _onTouched = () => { /** dummy */ };

  private _setIconKeyAndType(icon: string): void {
    // Set icon type if it is SVG or font-awesome
    switch (icon) {
      case 'search':
        this.iconKey = CoreDefinition.ASSETS_FONT_SEARCH;
        break;
      case 'caret-down':
        this.iconKey = CoreDefinition.ASSETS_FONT_CARET_DOWN;
        break;
      case 'loading':
        this.iconKey = CoreDefinition.ASSETS_GIF_SPINNER;
        break;
      case 'normal':
      default:
        this.iconKey = undefined;
        break;
    }
  }
}
