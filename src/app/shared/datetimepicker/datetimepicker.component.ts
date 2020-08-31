import {
  Component,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnDestroy,
  ElementRef,
  Optional,
  OnInit,
  DoCheck,
  Self
} from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
  FormGroupDirective,
  NgForm,
  NgControl
} from '@angular/forms';
import {
  Observable,
  BehaviorSubject
} from 'rxjs';
import {
  distinctUntilChanged,
  map
} from 'rxjs/operators';
import {
  NGX_MAT_DATE_FORMATS,
  NgxMatDateAdapter
} from '@angular-material-components/datetime-picker';
import {
  McsUniqueId,
  McsFormFieldControlBase
} from '@app/core';
import {
  coerceBoolean,
  ErrorStateMatcher,
  unsubscribeSafely,
  isNullOrEmpty,
  compareDates,
  coerceArray,
  getCurrentDate,
  addMonthsToDate,
  getSafeProperty
} from '@app/utilities';
import {
  MCS_DATE_FORMATS,
  DEFAULT_LOCALE,
  DEFAULT_LABEL,
  DEFAULT_HOUR_STEP,
  DEFAULT_MIN_STEP,
  DEFAULT_TIMEZONE,
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATETIME_FORMAT
} from './datetimepicker.constants';
import { formatDate } from '@angular/common';

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

  private _dateChange: BehaviorSubject<Date>;
  private _defaultMinutes: number = (CURRENT_DATE.getMinutes() >= 30) ? 0 : 30;

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
      this._dateChange.next(this._value);
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
  private _defaultTime: number[] = [CURRENT_DATE.getHours(), this._defaultMinutes];

  @Input()
  public dateFormat: string;

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
    this._dateChange = new BehaviorSubject(new Date());
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
    this.dateChanged.emit(this.value);
    this._propagateChange(this.value);
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
    this._propagateChange(value);
    this._dateChange.next(value);
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

  private _subscribeToDateChange(): void {
    this.dateString$ = this._dateChange.asObservable().pipe(
      distinctUntilChanged(),
      map((date) => formatDate(date.toUTCString(), this._getDefaultDateTimeFormat(), DEFAULT_LOCALE, DEFAULT_TIMEZONE))
    );
  }

  private _propagateChange = (_value: Date) => { };

  private _onTouched = () => { };
}
