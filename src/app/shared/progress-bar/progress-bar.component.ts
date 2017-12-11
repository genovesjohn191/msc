import {
  Component,
  forwardRef,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { coerceNumber } from '../../utilities';

export const PERCENTAGE_OFFSET = -5;

@Component({
  selector: 'mcs-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  public get maxValue(): number { return this._maxValue; }
  public set maxValue(value: number) { this._maxValue = coerceNumber(value); }
  private _maxValue: number;

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

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
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
      this._changeDetectorRef.markForCheck();
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

  /**
   * Event that emits when focus is removed
   */
  public onBlur(): void {
    this._onTouched();
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

  // View <-> Model callback methods
  private _onChanged: (value: any) => void = () => { /** dummy */ };
  private _onTouched = () => { /** dummy */ };
}
