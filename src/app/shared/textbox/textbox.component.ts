import {
  Component,
  OnInit,
  OnChanges,
  AfterViewInit,
  Input,
  Output,
  Renderer2,
  ElementRef,
  ViewChild,
  forwardRef,
  HostListener
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
  McsAssetsProvider,
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
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TextboxComponent),
      multi: true
    }
  ]
})

export class TextboxComponent
  implements OnInit, OnChanges, AfterViewInit, ControlValueAccessor, Validator, Loading {
  public iconClass: string;
  public isValid: boolean;
  public validationMessage: string;

  @Input()
  public inputType: 'text' | 'number' | 'password';

  @Input()
  public icon: string;

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
  public width: number;

  @Input()
  public borderColor: string;

  @Input()
  public readonly: boolean;

  @Input()
  public validationType: 'email' | 'ipAddress' | 'alphanumeric' | 'numeric' | 'pattern';

  @Input()
  public pattern: string;

  @ViewChild('mcsTextbox')
  public mcsTextbox: ElementRef;

  /**
   * On Touched Event Callback
   */
  private _onTouched: () => {};

  /**
   * On Changed Event Callback
   */
  private _onChanged: (_: any) => {};

  /**
   * Model Binding
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

  public get hasError(): boolean {
    return this.validationType && this.text && !this.isValid;
  }

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _textProvider: McsTextContentProvider,
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.inputType = 'text';
    this.isValid = false;
  }

  public ngOnInit() {
    this.validationMessage = this._textProvider.content.validationMessages[this.validationType];
  }

  public ngOnChanges() {
    if (this.icon) {
      this.iconClass = this.getIconClass(this.icon);
    }
  }

  public ngAfterViewInit() {
    if (this.width) {
      this._renderer.setStyle(this.mcsTextbox.nativeElement,
        'max-width', this.width + 'px');
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

  public getValidationPattern(validationType: string): RegExp {
    let pattern: RegExp;

    switch (validationType) {
      case 'email':
        pattern = CoreDefinition.REGEX_EMAIL_PATTERN;
        break;
      case 'ipAddress':
        pattern = CoreDefinition.REGEX_IP_PATTERN;
        break;
      case 'alphanumeric':
        pattern = CoreDefinition.REGEX_ALPHANUMERIC_PATTERN;
        break;
      case 'numeric':
        pattern = CoreDefinition.REGEX_NUMERIC_PATTERN;
        break;
      case 'pattern':
        pattern = new RegExp(this.pattern);
        break;
    }

    return pattern;
  }

  public validate(control: FormControl) {
    if (!this.validationType) { return; }

    let result: any;
    let regex = this.getValidationPattern(this.validationType);

    if (regex.test(control.value)) {
      this.isValid = true;
      result = null;
    } else {
      this.isValid = false;
      result = {
        validation: { valid: false }
      };
    }

    return result;
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

  public showLoader(): void {
    this.iconClass = this.getIconClass('spinner');
  }

  public hideLoader(): void {
    this.iconClass = this.getIconClass(this.icon);
  }

  public getIconClass(iconKey: string): string {
    return this._assetsProvider.getIcon(iconKey);
  }

}
