
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {
  addMonthsToDate,
  coerceBoolean,
  compareDates,
  getCurrentDate
} from '@app/utilities';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldInputDatePicker } from './field-input-date-picker';
import { DateAdapter } from '@angular/material/core';

const CURRENT_DATE = getCurrentDate();
const DEFAULT_MAXIMUM_DATE = addMonthsToDate(CURRENT_DATE, 6);
const DEFAULT_LOCALE = 'en-AU';

@Component({
  selector: 'mcs-field-input-date-picker',
  templateUrl: './field-input-date-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,

  host: {
    'class': 'date-picker-wrapper'
  }
})
export class FieldInputDatePickerComponent
  extends FormFieldBaseComponent2<any>
  implements IFieldInputDatePicker {

  @Output()
  public onDateChange = new EventEmitter<Date>();

  @Input()
  public get required(): boolean { return this._required; }
  public set required(value: boolean) { this._required = coerceBoolean(value); }
  private _required: boolean = false;

  @Input()
  public get minDate(): Date { return this._minDate; }
  public set minDate(min: Date) {
    if (min.getDay < new Date().getDay) {
      throw new Error('Declared minimum date count should not be later than or equal to current date');
    }
    if (compareDates(min, this._maxDate) === 1) {
      throw new Error('Declared minimum date should not be later than maximum date');
    }
    this._minDate = min;
  }
  private _minDate: Date = new Date();

  @Input()
  public get maxDate(): Date { return this._maxDate; }
  public set maxDate(max: Date) {
    if (compareDates(this._minDate, max) === 1) {
      throw new Error('Maximum date should be greater than minimum date');
    }
    this._maxDate = max;
  }
  private _maxDate: Date = DEFAULT_MAXIMUM_DATE;

  @Input()
  public get defaultDate(): Date { return this._defaultDate; }
  public set defaultDate(dateValue: Date) {
    if (compareDates(dateValue, this._minDate) === -1) {
      throw new Error('Declared date count should not be less than minimum date');
    }
    if (compareDates(dateValue, this._maxDate) === 1) {
      throw new Error('Declared date should not be later than maximum date');
    }
    this._defaultDate = dateValue;
  }
  private _defaultDate: Date = new Date();

  @Input()
  public filteredDates: any;

  constructor(_injector: Injector,
    private _adapter: DateAdapter<any>) {
    super(_injector);
    this._adapter.setLocale(DEFAULT_LOCALE);
  }

  public onDateChanged(event: any): void {
    let selectedDate = event?.target?.value?.toDateString();
    this.onDateChange.emit(selectedDate);
    this.writeValue(selectedDate);
  }
}
