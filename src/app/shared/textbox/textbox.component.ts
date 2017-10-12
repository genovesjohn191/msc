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
  ]
})

export class TextboxComponent
  implements OnInit, AfterViewInit, ControlValueAccessor, McsLoader {
  public iconKey: string;

  @Input()
  public valid: boolean;

  @Input()
  public inputType: 'text' | 'number' | 'password';

  @Input()
  public icon: 'normal' | 'search' | 'caret-down';

  @Input()
  public name: string;

  @Input()
  public step: number;

  @Input()
  public min: number;

  @Input()
  public max: number;

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

  /**
   * On Touched Event Callback
   */
  private _onTouched: () => {};

  /**
   * On Changed Event Callback
   */
  private _onChanged: (_: any) => {};

  public constructor(private _renderer: Renderer2) {
    this.inputType = 'text';
    this.valid = true;
    this.disabled = false;
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

  private _setIconKeyAndType(icon: string): void {
    // Set icon type if it is SVG or font-awesome
    switch (icon) {
      case 'search':
        this.iconKey = CoreDefinition.ASSETS_FONT_SEARCH;
        break;
      case 'caret-down':
        this.iconKey = CoreDefinition.ASSETS_FONT_CARET_DOWN;
        break;
      case 'normal':
      default:
        this.iconKey = undefined;
        break;
    }
  }
}
