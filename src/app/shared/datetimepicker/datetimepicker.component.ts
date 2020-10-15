
import 'moment-timezone';

import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  distinctUntilChanged,
  map
} from 'rxjs/operators';

import {
  NgxMatDateAdapter,
  NGX_MAT_DATE_FORMATS
} from '@angular-material-components/datetime-picker';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  ViewEncapsulation
} from '@angular/core';
import {
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import {
  McsFormFieldControlBase,
  McsUniqueId
} from '@app/core';
import {
  addMonthsToDate,
  coerceArray,
  coerceBoolean,
  compareDates,
  getCurrentDate,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  ErrorStateMatcher
} from '@app/utilities';

import {
  DATETIMEZONE_CONVERTER_FORMAT,
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_HOUR_STEP,
  DEFAULT_LABEL,
  DEFAULT_LOCALE,
  DEFAULT_MIN_STEP,
  MCS_DATE_FORMATS
} from './datetimepicker.constants';

const moment = require('moment-timezone');
const CURRENT_DATE = getCurrentDate();
const DEFAULT_MAXIMUM_DATE = addMonthsToDate(CURRENT_DATE, 6);

@Component({
  selector: 'mcs-datetimepicker',
  templateUrl: './datetimepicker.component.html',
  styleUrls: ['./datetimepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: McsFormFieldControlBase, useExisting: DateTimePickerComponent },
    { provide: NGX_MAT_DATE_FORMATS, useValue: MCS_DATE_FORMATS },
  ],
  host: {
    'class': 'datetimepicker-wrapper'
  }
})
export class DateTimePickerComponent extends McsFormFieldControlBase<any>
  implements OnInit, OnDestroy, DoCheck {

  public dateString$: Observable<string>;

  private _dateChange: BehaviorSubject<moment.Moment>;

  @Output()
  public dateChanged: EventEmitter<Date> = new EventEmitter<Date>();

  @Input()
  public id: string = McsUniqueId.NewId('mcs-datetimepicker');

  @Input()
  public get label(): string { return this._label; }
  public set label(value: string) {
    if (value !== this._label) {
      this._label = value;
    }
  }
  private _label: string;

  @Input()
  public get value(): Date { return this._value; }
  public set value(selectedDate: Date) {
    if (this._value !== selectedDate) {
      this._value = selectedDate;
      let momentDate = this._createDateWithProperTimezone(this._value);
      this._dateChange.next(momentDate);
    }
  }
  private _value: Date;

  @Input()
  public get disabled(): boolean { return this._disabled; }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

  @Input()
  public placeholder: string = DEFAULT_LABEL;

  @Input()
  public errorStateMatcher: ErrorStateMatcher;

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
  public get hideTime(): boolean { return this._hideTime; }
  public set hideTime(value: boolean) { this._hideTime = coerceBoolean(value); }
  private _hideTime: boolean = false;

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
  private _stepMinute: number = DEFAULT_MIN_STEP;

  @Input()
  public enableMeridian: boolean = false;

  @Input()
  public get defaultTime(): number[] { return this._defaultTime; }
  public set defaultTime(value: number[]) { this._defaultTime = coerceArray(value); }
  private _defaultTime: number[];

  @Input()
  public dateFormat: string;

  @Input()
  public timezone: string = moment.tz.guess();

  @Input()
  public locale: string = moment.locale();

  constructor(
    private _adapter: NgxMatDateAdapter<any>,
    _overlayContainer: OverlayContainer,
    _elementRef: ElementRef,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective
  ) {
    super(_elementRef.nativeElement, _parentFormGroup || _parentForm);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    _overlayContainer.getContainerElement().classList.add('mcs-overlay-theme');
    this._adapter.setLocale(DEFAULT_LOCALE);
    this.dateChanged = new EventEmitter();
    this._dateChange = new BehaviorSubject(moment());
  }

  public ngOnInit(): void {
    this.initializeLabel();
    this._subscribeToDateChange();
  }

  public ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.dateChanged);
  }

  public onDateTimePickerChange(event: MatDatepickerInputEvent<any>) {
    this.value = getSafeProperty(event.value, (obj) => obj.toDate());
    let convertedDate = this._createDateWithProperTimezone(this.value).utc().toDate();
    this.dateChanged.emit(convertedDate);
    this._propagateChange(convertedDate);
    this._onTouched();
  }

  public onBlurInput(): void {
    this._onTouched();
  }

  public onCloseCalendar(): void {
    this._onTouched();
  }

  public initializeLabel(): void {
    if (isNullOrEmpty(this.label)) {
      this._label = DEFAULT_LABEL;
    }
  }

  public isEmpty(): boolean {
    return isNullOrEmpty(this.value);
  }

  public writeValue(value: Date): void {
    if (isNullOrEmpty(value)) { return; }
    let convertedDate = this._createDateWithProperTimezone(value);
    this._dateChange.next(convertedDate);
    this._propagateChange(convertedDate.utc().toDate());
    let convertedDateInTimezone = moment(convertedDate).tz(this.timezone);
    this.defaultTime = [convertedDateInTimezone.hours(), convertedDateInTimezone.minutes()];
  }

  public valueIsNullOrEmpty(value: string): boolean {
    return isNullOrEmpty(value);
  }

  /**
   * On Change Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnChange(fn: any): void {
    this._propagateChange = fn;
  }

  /**
   * On Touched Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  private _getDefaultDateTimeFormat(): string {
    if (!isNullOrEmpty(this.dateFormat)) { return this.dateFormat; }
    return this._hideTime ? DEFAULT_DATE_FORMAT : DEFAULT_DATETIME_FORMAT;
  }

  private _createDateWithProperTimezone(value: Date): moment.Moment {
    moment.locale(this.locale);
    moment.tz.setDefault(this.timezone);
    let formattedDate = moment(value).clone().format(DATETIMEZONE_CONVERTER_FORMAT);
    let momentObj = moment.tz(formattedDate, this.timezone);
    return momentObj;
  }

  private _subscribeToDateChange(): void {
    this.dateString$ = this._dateChange.asObservable().pipe(
      distinctUntilChanged(),
      map((momentDate: moment.Moment) => {
        return moment(momentDate).tz(this.timezone).format(this._getDefaultDateTimeFormat());
      })
    );
  }

  private _propagateChange = (_value: Date) => { };

  private _onTouched = () => { };
}
