import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  OnChanges,
  OnDestroy,
  DoCheck,
  Optional,
  Self
} from '@angular/core';
import {
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import {
  McsFormFieldControlBase,
  McsPlatformService,
  McsUniqueId
} from '@app/core';
import {
  isNullOrEmpty,
  ErrorStateMatcher,
  coerceBoolean
} from '@app/utilities';

// Invalid types for input
const MCS_INPUT_INVALID_TYPES = [
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit'
];

@Directive({
  selector: `input[mcsInput], textarea[mcsInput]`,
  host: {
    'class': 'input-wrapper',
    '[attr.id]': 'id',
    '[attr.placeholder]': 'getPlaceholder()',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '(blur)': 'focusChanged(false)',
    '(focus)': 'focusChanged(true)',
    '(input)': 'onInput()'
  },
  providers: [{ provide: McsFormFieldControlBase, useExisting: InputDirective }]
})

export class InputDirective extends McsFormFieldControlBase<any>
  implements OnChanges, OnDestroy, DoCheck {

  @Input()
  public id: string = McsUniqueId.NewId('input');

  @Input()
  public placeholder: string;

  @Input()
  public errorStateMatcher: ErrorStateMatcher;

  @Input()
  public get required(): boolean { return this._required; }
  public set required(value: boolean) { this._required = coerceBoolean(value); }
  private _required: boolean = false;

  @Input()
  public get disabled(): boolean {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }
  public set disabled(value: boolean) {
    this._disabled = coerceBoolean(value);

    // Browsers may not fire the blur event if the input is disabled too quickly.
    // Reset from here to ensure that the element doesn't become stuck.
    if (this._disabled) {
      this.focusChanged(false);
    }
  }
  private _disabled: boolean = false;

  @Input()
  public get type(): string { return this._type; }
  public set type(value: string) {
    this._type = value || 'text';
    this.validateType();

    if (!this.isTextarea()) {
      this._renderer.setProperty(this._elementRef.nativeElement, 'type', this._type);
    }
  }
  private _type: string;

  /**
   * Base value implementation of value accessor
   */
  @Input()
  public get value(): string { return this._elementRef.nativeElement.value; }
  public set value(value: string) {
    if (value !== this.value) {
      this._elementRef.nativeElement.value = value;
      this.stateChanges.next();
    }
  }
  private _previousNativeValue = this.value;

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _platformService: McsPlatformService,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
  ) {
    // Set the data for form base
    super(_elementRef.nativeElement, _parentFormGroup || _parentForm);
  }

  public ngDoCheck(): void {
    if (this.ngControl) { this.updateErrorState(); }
    this._dirtyCheckNativeValue();
  }

  public ngOnChanges(): void {
    this.stateChanges.next();
  }

  public ngOnDestroy(): void {
    this.stateChanges.complete();
  }

  public validateType(): void {
    if (MCS_INPUT_INVALID_TYPES.indexOf(this._type) > -1) {
      throw new Error('Input type is not supported');
    }
  }

  /**
   * Determines if the component host is a textarea. If not recognizable it returns false.
   */
  public isTextarea() {
    let nativeElement = this._elementRef.nativeElement;
    let nodeName = this._platformService.isBrowser ? nativeElement.nodeName : nativeElement.name;
    return nodeName ? nodeName.toLowerCase() === 'textarea' : false;
  }

  /**
   * Callback for the cases where the focused state of the input changes.
   * @param isFocused Focus flag
   */
  public focusChanged(isFocused: boolean) {
    if (isFocused !== this.focused) {
      this.focused = isFocused;
      this.stateChanges.next();
    }
  }

  /**
   * Event that trigger whenever a value is inputted on the textbox
   */
  public onInput() {
    // This is a noop function and is used to let Angular know whenever the value changes.
    // Angular will run a new change detection each time the `input` event has been dispatched.
  }

  /**
   * Base implementation of empty checking
   */
  public isEmpty(): boolean {
    return isNullOrEmpty(this.value);
  }

  /**
   * Does some manual dirty checking on the native input `value` property.
   */
  private _dirtyCheckNativeValue() {
    let newValue = this.value;
    if (this._previousNativeValue !== newValue) {
      this._previousNativeValue = newValue;
      this.stateChanges.next();
    }
  }
}
