import {
  Component,
  Output,
  ViewChild,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnDestroy,
  ElementRef,
  Optional,
  OnInit,
  forwardRef} from '@angular/core';
import {
  MatDatepicker,
  MatDatepickerInputEvent,
  MAT_DATE_FORMATS,
  DateAdapter,
  MatDateFormats,
  MAT_NATIVE_DATE_FORMATS} from '@angular/material';
import {OverlayContainer} from '@angular/cdk/overlay';
import {
  FormGroupDirective,
  NgForm,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  ValidationErrors,
  FormControl} from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { McsUniqueId,
  McsFormFieldControlBase } from '@app/core';
import {
  coerceBoolean,
  ErrorStateMatcher,
  unsubscribeSafely,
  isNullOrEmpty,
  compareDates,
  coerceArray,
  getCurrentDate,
  addMonthsToDate} from '@app/utilities';
import { distinctUntilChanged } from 'rxjs/operators';
import { NgxMatDateFormats, NGX_MAT_DATE_FORMATS, NgxMatDateAdapter } from '@angular-material-components/datetime-picker';

const CURRENT_DATE = getCurrentDate();
const DEFAULT_MAXIMUM_DATE = addMonthsToDate(CURRENT_DATE, 6);
const MCS_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: 'LL'
  },
  display: {
    dateInput: 'DD/MM/YYYY hh:mm A',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};
const DEFAULT_LOCALE = 'en-AU';
const DEFAULT_LABEL = 'Choose a date';

@Component({
  selector: 'mcs-datetimepicker',
  templateUrl: './datetimepicker.component.html',
  styleUrls: ['./datetimepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: McsFormFieldControlBase, useExisting: DateTimePickerComponent },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    },
  { provide: NGX_MAT_DATE_FORMATS, useValue: MCS_DATE_FORMATS },
  ]
})
export class DateTimePickerComponent  extends McsFormFieldControlBase<any> implements ControlValueAccessor, Validator, OnInit, OnDestroy {

  public date$: Observable<Date>;

  private _dateChange: BehaviorSubject<Date>;

  constructor(private _overlayContainer: OverlayContainer,
              private _adapter: NgxMatDateAdapter<any>,
              _elementRef: ElementRef,
              @Optional() _parentForm: NgForm,
              @Optional() _parentFormGroup: FormGroupDirective) {
          super(_elementRef.nativeElement, _parentFormGroup || _parentForm);
          _overlayContainer.getContainerElement().classList.add('mcs-overlay-theme');
          this.dateChanged = new EventEmitter();
          this._dateChange = new BehaviorSubject(new Date());
          this._adapter.setLocale(DEFAULT_LOCALE);
  }

  @Input()
  public id: any = McsUniqueId.NewId('mcs-datetimepicker');

  @Input()
  public get label(): string { return this._label; }
  public set label(value: string) {
    if (value !== this._label) {
      this._label = value;
    }
  }

  @Input()
  public get value(): Date { return this._value; }
  public set value(selectedDate: Date) {
    if (this._value !== selectedDate) {
      this._value = selectedDate;
      this._dateChange.next(this._value);
    }
  }

  @Input()
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }

  @Input()
  public placeholder: string;

  @Output()
  dateChanged: EventEmitter<Date> = new EventEmitter<Date>();

  @Input()
  public errorStateMatcher: ErrorStateMatcher;

  @Input()
  public get required(): boolean {
    return this._required;
  }
  public set required(value: boolean) { this._required = coerceBoolean(value); }

  @Input()
  public get minDate(): Date {
    return this._minDate;
  }
  public set minDate(min: Date) {
    if (min.getDay < new Date().getDay) {
      throw new Error('Declared minimum date count should not be later than or equal to current date');
    }
    if (compareDates(min, this._maxDate) === 1) {
      throw new Error('Declared minimum date should not be later than maximum date');
    }
    this._minDate = min;
  }

  @Input()
  public get maxDate(): Date {
    return this._maxDate;
  }
  public set maxDate(max: Date) {
    if (compareDates(this._minDate, max) === 1) {
      throw new Error('Maximum date should be greater than minimum date');
    }
    this._maxDate = max;
  }

  @Input()
  public get showTimePicker(): boolean {
    return this._showTimePicker;
  }
  public set showTimePicker(value: boolean) { this._showTimePicker = coerceBoolean(value); }


  @Input()
  public get stepHour(): number {
    return this._stepHour;
  }
  public set stepHour(step: number) {
    if (step <= 0) { throw new Error('Hour step should be greater than 0'); }
    this._stepHour = step;
  }

  @Input()
  public get stepMinute(): number {
    return this._stepMinute;
  }
  public set stepMinute(step: number) {
    if (step <= 0) { throw new Error('Minute step should be greater than 0'); }
    this._stepMinute = step;
  }

  @Input()
  public get defaultTime(): number[] {
    return this._defaultTime;
  }
  public set defaultTime(value: number[]) { this._defaultTime = coerceArray(value); }

  private _defaultMinutes: number = (CURRENT_DATE.getMinutes() >= 30) ? 0 : 30;
  private _defaultTime: number[] = [CURRENT_DATE.getHours(), this._defaultMinutes];
  private _showTimePicker: boolean = true;
  private _stepHour: number;
  private _stepMinute: number;
  private _label: string;
  private _value: Date;
  private _disabled: boolean = false;
  private _required: boolean = false;
  private _minDate: Date = new Date();
  private _maxDate: Date = DEFAULT_MAXIMUM_DATE;
  private _validators: Function[] = [];

  public ngOnInit(): void {
    this.initializeLabel();
    this._subscribeToDateChange();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.dateChanged);
  }

  public onDateTimePickerChange(event: MatDatepickerInputEvent<any>) {
    this.value = event.value.toDate();
    this.dateChanged.emit(event.value);
  }

  public initializeLabel(): void {
    if (isNullOrEmpty(this.label)) {
      this._label = DEFAULT_LABEL;
    }
  }

  public isEmpty(): boolean {
    return isNullOrEmpty(this.value);
  }

  public writeValue(value: any): void {
    if (isNullOrEmpty(value)) { return; }
    this.value = new Date(value);
    this._dateChange.next(this.value);
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
  public registerOnTouched(_fn: any): void { /* Dummy */ }

  /**
   * validate method implementation of Validator
   * @param _control form control to validate
   */
  public validate(_control: FormControl): ValidationErrors | null {
    let errors = {};
    this._validators.forEach((error) => {
      errors = { ...errors, ...error };
    });
    return errors;
  }

  private _propagateChange = (_value: Date) => { };

  private _subscribeToDateChange(): void {
    this.date$ = this._dateChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

}
