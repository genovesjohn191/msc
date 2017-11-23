import {
  Component,
  Input,
  HostBinding,
  forwardRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'mcs-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.sliderValue = 0;
    this.disabled = false;
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    if (this._sliderValue !== value) {
      this._sliderValue = value;
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

  // View <-> Model callback methods
  private _onChanged: (value: any) => void = () => { /** dummy */ };
  private _onTouched = () => { /** dummy */ };
}
