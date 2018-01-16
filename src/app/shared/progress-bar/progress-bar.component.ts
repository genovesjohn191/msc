import {
  Component,
  forwardRef,
  Input,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { coerceNumber } from '../../utilities';

@Component({
  selector: 'mcs-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProgressBarComponent),
      multi: true
    }
  ],
  host: {
    'class': 'progress-bar-wrapper'
  }
})

export class ProgressBarComponent implements ControlValueAccessor {
  @Input()
  public get maxValue(): number { return this._maxValue; }
  public set maxValue(value: number) { this._maxValue = coerceNumber(value); }
  private _maxValue: number;

  /**
   * Model Value of the Progressbar (Two way binding)
   */
  @Input()
  public get value() { return this._value; }
  public set value(value: any) {
    if (value !== this._value) {
      this._value = value;
      this._onChanged(value);
      this._changeDetectorRef.markForCheck();
    }
  }
  private _value: any;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.maxValue = 0;
    this._value = 0;
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    this.value = value;
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
