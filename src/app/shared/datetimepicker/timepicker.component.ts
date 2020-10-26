import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  ElementRef,
  Optional,
  Output,
  EventEmitter,
  DoCheck,
  Self,
  ChangeDetectorRef
} from '@angular/core';
import {
  ControlValueAccessor,
  NgForm,
  FormGroupDirective,
  NgControl
} from '@angular/forms';
import {
  NGX_MAT_DATE_FORMATS,
  NgxMatDateAdapter
} from '@angular-material-components/datetime-picker';
import { OverlayContainer } from '@angular/cdk/overlay';
import * as moment from 'moment';
import {
  McsFormFieldControlBase,
  McsUniqueId
} from '@app/core';
import {
  ErrorStateMatcher,
  isNullOrEmpty,
  coerceBoolean,
  isNullOrUndefined,
  getCurrentDate,
  minimizeByStepValue,
  compareArrays
} from '@app/utilities';
import {
  MCS_DATE_FORMATS,
  DEFAULT_LOCALE,
  DEFAULT_HOUR_STEP,
  DEFAULT_MIN_STEP,
  DEFAULT_MIN_TIME,
  DEFAULT_MAX_TIME
} from './datetimepicker.constants';

const CURRENT_DATE = getCurrentDate();

@Component({
  selector: 'mcs-timepicker',
  templateUrl: './timepicker.component.html',
  styleUrls: ['./timepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: McsFormFieldControlBase, useExisting: TimePickerComponent },
    { provide: NGX_MAT_DATE_FORMATS, useValue: MCS_DATE_FORMATS },
  ],
  host: {
    'class': 'timepicker-wrapper'
  }
})
export class TimePickerComponent extends McsFormFieldControlBase<any> implements ControlValueAccessor, DoCheck {

  public dateModel: moment.Moment = moment(CURRENT_DATE);

  @Output()
  public timeChange = new EventEmitter<[number, number]>();

  @Input()
  public id: string = McsUniqueId.NewId('timepicker');

  @Input()
  public get value(): [number, number] { return this._value; }
  public set value(time: [number, number]) {
    if (compareArrays(this._value, time) === 0) { return; }
      this._value = time;
      this.dateModel.hour(time[0]);
      this.dateModel.minute(time[1]);
  }
  private _value: [number, number] = [CURRENT_DATE.getHours(), CURRENT_DATE.getMinutes()];

  @Input()
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

  @Input()
  public get required(): boolean {
    return this._required;
  }
  public set required(value: boolean) { this._required = coerceBoolean(value); }
  private _required: boolean = false;

  @Input()
  public placeholder: string;

  @Input()
  public enableMeridian: boolean = false;

  @Input()
  public errorStateMatcher: ErrorStateMatcher;

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

  public get showSeconds(): boolean { return this._showSeconds; }
  private _showSeconds: boolean = false; // Do not show seconds

  @Input()
  public get showSpinners(): boolean { return this._showSpinners; }
  public set showSpinners(flag: boolean) { this._showSpinners = flag; }
  private _showSpinners: boolean = false;

  @Input()
  public  minTime: [number, number] = DEFAULT_MIN_TIME;

  @Input()
  public maxTime: [number, number] = DEFAULT_MAX_TIME;

  constructor(
    private _adapter: NgxMatDateAdapter<any>,
    private _changeRefDetector: ChangeDetectorRef,
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
    this.timeChange = new EventEmitter();
  }

  public ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  /**
   * Event listener whenever the model changes
   */
  public onModelChange(value: moment.Moment): void {
    this.dateModel = value;
    let dateObj: Date = this.dateModel.toDate();
    let timeObj: [number, number] = [dateObj.getHours(), dateObj.getMinutes()];

    this.timeChange.emit(timeObj);
    this._propagateChange(timeObj);
    this._changeRefDetector.markForCheck();
    this._onTouched();
  }

  /**
   * Base implementation of empty checking
   */
  public isEmpty(): boolean {
    return isNullOrEmpty(this.value);
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: [number, number]): void {
    if (isNullOrUndefined(value)) { return; }
    let validTime = this._getValidTime(value[0], value[1]);
    this.dateModel.hour(validTime[0]);
    this.dateModel.minute(validTime[1]);
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

  private _getValidTime(hour: number, minute: number): [number, number] {
    let normalizeHour = minimizeByStepValue(hour, this.stepHour);
    let normalizeMinute = minimizeByStepValue(minute, this.stepMinute);
    let resultTime: [number, number] = [normalizeHour, normalizeMinute];
    resultTime = this._getValidMinTime(resultTime);
    resultTime = this._getValidMaxTime(resultTime);

    return resultTime;
  }
  // TO DO: for unit test
  private _getValidMinTime(time: [number, number]): [number, number] {
    let isHourValueLessThanFloorHour = time[0] < this.minTime[0];
    if (isHourValueLessThanFloorHour) { return this.minTime; }

    let isHourValueEqualFloorHour = time[0] === this.minTime[0];
    let isMinuteValueLessThanFloorMinute = time[1] < this.minTime[1];
    if (isHourValueEqualFloorHour && isMinuteValueLessThanFloorMinute) { return this.minTime; }

    return time;
  }
  // TO DO: for unit test
  private _getValidMaxTime(time: [number, number]): [number, number] {
    let isHourValueMoreThanCeilHour = time[0] > this.maxTime[0];
    if (isHourValueMoreThanCeilHour) { return this.maxTime; }

    let isHourValueEqualCeilHour = time[0] === this.maxTime[0];
    let isMinuteValueMoreThanCeilMinute = time[1] > this.maxTime[1];
    if (isHourValueEqualCeilHour && isMinuteValueMoreThanCeilMinute) { return this.maxTime; }

    return time;
  }

  private _propagateChange = (_value: [number, number]) => { };

  private _onTouched = () => { };
}
