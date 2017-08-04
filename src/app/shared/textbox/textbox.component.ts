import {
  Component,
  OnInit,
  OnChanges,
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
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  FormControl
} from '@angular/forms';

/** Interface */
import { Loading } from '../loading.interface';

/** Providers */
import {
  McsTextContentProvider,
  CoreDefinition
} from '../../core';

/** Enum */
import { McsTextboxValidationType } from './textbox-type.enum';

@Component({
  selector: 'mcs-textbox',
  templateUrl: './textbox.component.html',
  styles: [require('./textbox.component.scss')],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextboxComponent),
      multi: true
    }
  ]
})

export class TextboxComponent
  implements OnInit, AfterViewInit, ControlValueAccessor, Loading {
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
  @HostBinding('style.max-width')
  public width: string;

  @ViewChild('mcsTextbox')
  public mcsTextbox: ElementRef;

  /**
   * Model Binding Property
   */
  private _text: string;
  public get text(): string {
    return this._text;
  }
  public set text(value: string) {
    if (value !== this._text) {
      this._text = value;
      if (this._onChanged) {
        this._onChanged(value);
      }
    }
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.inputType = 'text';
    this.valid = true;
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

  public onFocus(event): void {
    this._renderer.addClass(this.mcsTextbox.nativeElement, 'active');
  }

  public onFocusOut(event): void {
    this._renderer.removeClass(this.mcsTextbox.nativeElement, 'active');
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    this._text = value;
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
  public onTouched() {
    this._onTouched(null);
  }

  public showLoader(): void {
    this.iconKey = CoreDefinition.ASSETS_FONT_SPINNER;
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

  /**
   * On Touched Event Callback
   */
  private _onTouched: any = () => {
    // This is for reference only
    // it will populate during model binding
  }

  /**
   * On Changed Event Callback
   */
  private _onChanged: any = (_: any) => {
    // This is for reference only
    // it will populate during model binding
  }
}
