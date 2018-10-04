import {
  Component,
  forwardRef,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { coerceNumber } from '@app/utilities';

@Component({
  selector: 'mcs-capacity-bar',
  templateUrl: './capacity-bar.component.html',
  styleUrls: ['./capacity-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CapacityBarComponent),
      multi: true
    }
  ],
  host: {
    'class': 'capacity-bar-wrapper'
  }
})

export class CapacityBarComponent implements ControlValueAccessor {
  @Input()
  public get maxValue(): number { return this._maxValue; }
  public set maxValue(value: number) { this._maxValue = coerceNumber(value); }
  private _maxValue: number;

  /**
   * Returns the current value of the capacity bar
   */
  private _value: number;
  public get value(): number {
    return this._value;
  }
  public set value(newValue: number) {
    if (newValue !== this._value) {
      this._value = newValue;
      this._onChanged(newValue);
    }
  }

  private _percentage: string;
  public get percentage(): string {
    return this._percentage;
  }
  public set percentage(value: string) {
    if (this._percentage !== value) {
      this._percentage = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _isLow: boolean;
  public get isLow(): boolean {
    return this._isLow;
  }
  public set isLow(value: boolean) {
    if (this._isLow !== value) {
      this._isLow = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.maxValue = 0;
    this.value = 0;
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    if (value !== this._value) {
      this._value = value;
      this._setPercentage();
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

  private _setPercentage(): void {
    let percentage = this._getPercentage();
    this.isLow = percentage >= 85;
    this.percentage = `${percentage}%`;
  }

  private _getPercentage(): number {
    // Return the percentage of the current value based on the maximum value inputted
    let percentage = 100 * this.value / this.maxValue;
    return Math.round(percentage);
  }

  // View <-> Model callback methods
  private _onChanged: (value: any) => void = () => { /** dummy */ };
  private _onTouched = () => { /** dummy */ };
}
