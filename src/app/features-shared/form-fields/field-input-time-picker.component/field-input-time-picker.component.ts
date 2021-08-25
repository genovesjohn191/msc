import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  ViewEncapsulation
} from '@angular/core';
import {
  coerceBoolean
} from '@app/utilities';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldInputTimePicker } from './field-input-time-picker';

const DEFAULT_HOUR_STEP = 1;
const DEFAULT_MINUTE_STEP = 1;

@Component({
  selector: 'mcs-field-input-time-picker',
  templateUrl: './field-input-time-picker.component.html',
  styleUrls: ['./field-input-time-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,

  host: {
    'class': 'time-picker-wrapper'
  }
})
export class FieldInputTimePickerComponent
  extends FormFieldBaseComponent2<string>
  implements IFieldInputTimePicker {

  private _isTimePickerActive: boolean = false;

  @Input()
  public get required(): boolean { return this._required; }
  public set required(value: boolean) { this._required = coerceBoolean(value); }
  private _required: boolean = false;

  @Input()
  public get minTime(): string { return this._minTime; }
  public set minTime(min: string) {
    this._minTime = min;
  }
  private _minTime: string;

  @Input()
  public get maxTime(): string { return this._maxTime; }
  public set maxTime(max: string) {
    this._maxTime = max;
  }
  private _maxTime: string;

  @Input()
  public get stepHour(): number { return this._stepHour; }
  public set stepHour(step: number) {
    if (step <= 0) { throw new Error('Hour step should be greater than 0'); }
    this._stepHour = step;
  }
  private _stepHour: number = DEFAULT_HOUR_STEP;

  @Input()
  public get stepMinute(): number { return this._stepMinute; }
  public set stepMinute(step: number) {
    if (step <= 0) { throw new Error('Minute step should be greater than 0'); }
    this._stepMinute = step;
  }
  private _stepMinute: number = DEFAULT_MINUTE_STEP;

  @Input()
  public timeFormat: string;

  public get timePickerActive(): boolean {
    return this._isTimePickerActive;
  }

  constructor(_injector: Injector) {
    super(_injector);
  }

  public onTimeChanged(time: string): void {
    this.writeValue(time);
  }

  public onTimePickerClose(): void {
    this._isTimePickerActive = false;
  }

  public onTimePickerOpen(): void {
    this._isTimePickerActive = true;
  }
}
