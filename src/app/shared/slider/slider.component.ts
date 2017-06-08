import {
  Component,
  AfterViewInit,
  Input,
  HostBinding,
  forwardRef
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'mcs-slider',
  templateUrl: './slider.component.html',
  styles: [require('./slider.component.scss')],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true
    }
  ]
})

export class SliderComponent {

  @Input()
  public name: string;

  @Input()
  public step: number;

  @Input()
  public min: number;

  @Input()
  public max: number;

  @Input()
  @HostBinding('style.max-width')
  public width: string;

  @Input()
  public disabled: boolean;

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
  private _sliderValue: number;

  public get sliderValue(): number {
    return this._sliderValue;
  }

  public set sliderValue(value: number) {
    if (value !== this._sliderValue) {
      this._sliderValue = value;
      if (this._onChanged) {
        this._onChanged(value);
      }
    }
  }

  public constructor() {
    this.sliderValue = 0;
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    this._sliderValue = value;
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
}
