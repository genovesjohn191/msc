import {
  Component,
  forwardRef,
  Input
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

export const PERCENTAGE_OFFSET = -5;

@Component({
  selector: 'mcs-progress-bar',
  templateUrl: './progress-bar.component.html',
  styles: [require('./progress-bar.component.scss')],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProgressBarComponent),
      multi: true
    }
  ]
})

export class ProgressBarComponent implements ControlValueAccessor {
  @Input()
  public maxValue: number;

  /**
   * On Touched Event Callback
   */
  private _onTouched: () => {};

  /**
   * On Changed Event Callback
   */
  private _onChanged: (_: any) => {};

  /**
   * IsChecked Flag
   */
  private _value: number;
  public get value(): number {
    return this._value;
  }
  public set value(updatedValue: number) {
    if (updatedValue !== this._value) {
      this._value = updatedValue;
      this._onChanged(updatedValue);
    }
  }

  public constructor() {
    this.maxValue = 0;
    this._value = 0;
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    if (value !== this._value) {
      this._value = value;
    }
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

  public getValueInRange(): number {
    // Minimum value should be equal to 0 aways
    return Math.max(Math.min(this.value, this.maxValue), 0);
  }

  public getPercentage(): string {
    // Return the percentage of the current value based on the maximum value inputted
    let percentNumber = 100 * this.getValueInRange() / this.maxValue;
    return percentNumber.toFixed().toString() + '%';
  }
}
