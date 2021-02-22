import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import { Subject } from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  CoreValidators,
  IMcsDataChange,
  IMcsFormGroup
} from '@app/core';
import { InputManageType, InternetPlan } from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import {
  animateFactory,
  coerceNumber,
  convertGbToMb,
  convertMbToGb,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely
} from '@app/utilities';
import {
  InternetManagePortPlan,
  internetPortSpeedSliderDefaultValues
} from './internet-manage-port-plan';

/** Monthly Cap */
const DEFAULT_STEP_MONTHLY_CAP = 50;
const DEFAULT_MAX_MONTHLY_CAP = 1024;
const DEFAULT_MIN_MONTHLY_CAP = 1;

/** Port Speed */
const DEFAULT_STEP_PORT_SPEED = 1;
const DEFAULT_MIN_PORT_SPEED = 0;

@Component({
  selector: 'mcs-internet-manage-port-plan',
  templateUrl: 'internet-manage-port-plan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ]
})

export class InternetManagePortPlanComponent
  implements OnInit, AfterViewInit, OnDestroy, IMcsFormGroup, IMcsDataChange<InternetManagePortPlan> {

  public inputManageType: InputManageType;
  public monthlyCapSliderValueIndex: number;

  // port speed
  public portSpeedSliderValueIndex: number;
  public portSpeedSliderValue: number;
  public sliderTable: InternetManagePortPlan[];
  public sliderTableSize: number;

  // Forms control
  public fgInternetPortPlan: FormGroup;
  public fcCustomMonthlyCap: FormControl;
  public fcCustomPortSpeed: FormControl;

  @Output()
  public dataChange = new EventEmitter<InternetManagePortPlan>();

  @Input()
  public get monthlyCap(): number { return this._monthlyCap; }
  public set monthlyCap(value: number) {
    this._monthlyCap = convertMbToGb(coerceNumber(value, 0));
  }

  @Input()
  public get portSpeed(): number { return this._portSpeed; }
  public set portSpeed(value: number) {
    this._portSpeed = coerceNumber(value, 0);
  }

  @Input() public plan: number;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _formControlsMap = new Map<InputManageType, () => void>();
  private _portPlanOutput = new InternetManagePortPlan();
  private _monthlyCap: number = 0;
  private _portSpeed: number = 0;

  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder
  ) {
    this._createFormControlsMap();
  }

  public ngOnInit() {
    this._createPortSpeedSliderTable();
    this._registerFormGroup();
    this._reset();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._subscribeToFormTouchedState();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  public isValid(): boolean {
    return getSafeProperty(this.fgInternetPortPlan, (obj) => obj.valid);
  }

  public get inputManageTypeEnum(): any {
    return InputManageType;
  }

  /**
   * Returns the step value used on the monthly cap slider
   */
  public get monthlyCapSliderStep(): number {
    return DEFAULT_STEP_MONTHLY_CAP;
  }

  /**
   * Returns min monthly cap value
   */
  public get monthlyCapMin(): number {
    return DEFAULT_MIN_MONTHLY_CAP;
  }

  /**
   * Returns max monthly cap value
   */
  public get monthlyCapMax(): number {
    return DEFAULT_MAX_MONTHLY_CAP;
  }

  /**
   * Returns the default step value used on the portal speed slider
   */
  public get portSpeedSliderStep(): number {
    return DEFAULT_STEP_PORT_SPEED;
  }

  /**
   * Returns min port speed value
   */
  public get portSpeedMin(): number {
    return DEFAULT_MIN_PORT_SPEED;

  }

  /**
   * Returns max port speed value
   */
  public get portSpeedMax(): number {
    return this.sliderTableSize;
  }

  public isInternetPlanUnlimited(plan: number): boolean {
    return plan === InternetPlan.Unlimited;
  }

  /**
   * Event that emits when the input manage type has been changed
   */
  public onChangeInputManageType(inputManageType: InputManageType) {
    this.inputManageType = inputManageType;
    this._registerFormControlsByInputType();
    this.notifyDataChange();
  }

  /**
   * Event that emits when the port speed slider value has changed
   * @param index Slider value as index
   */
  public onPortSpeedSliderChanged(index) {
    this.portSpeedSliderValueIndex = index;
    this.portSpeedSliderValue = this.sliderTable[index].portSpeed;
    this.notifyDataChange();
  }

  /**
   * Event that emits when the monthly cap slider value has changed
   * @param index Slider value as index
   */
  public onMonthlyCapSliderChanged(index: number) {
    let sliderValueIndexNotOneOrNotDivisbleBy50 = index % 50 !== 0 && index !== 1;
    this.monthlyCapSliderValueIndex = (sliderValueIndexNotOneOrNotDivisbleBy50) ?
      index - 1 : index;
    if (index >= this.monthlyCapMax) {
      this.monthlyCapSliderValueIndex = this.monthlyCapMax;
    }
    this.notifyDataChange();
  }

  /**
   * Event that emits when monthly cap is changed
   */
  public onMonthlyCapChange(): void {
    if (isNullOrEmpty(this.fcCustomMonthlyCap)) { return; }
    let monthlyCapInput: number = +this.fcCustomMonthlyCap.value;
    this.fcCustomMonthlyCap.setValue(monthlyCapInput);
  }

  /**
   * Updates form validities
   */
  public _updateAllFormValidity(): void {
    this.fcCustomMonthlyCap.updateValueAndValidity();
    this.fgInternetPortPlan.updateValueAndValidity();
  }

  /**
   * Event that emits when an input has been changed
   */
  public notifyDataChange() {
    let updatedMonthlyCapValue = convertGbToMb(coerceNumber(this.setMonthlyCapValue()));
    let currentMonthlyCap = convertGbToMb(coerceNumber(this._monthlyCap));
    this._portPlanOutput.portSpeed = this.portSpeedSliderValue || this.sliderTable[0].portSpeed;

    switch (this.inputManageType) {
      case InputManageType.Custom:
        this._portPlanOutput.monthlyCap = updatedMonthlyCapValue;
        this._portPlanOutput.valid = this.fcCustomMonthlyCap.valid
        break;
      case InputManageType.Auto:
      default:
        this._portPlanOutput.monthlyCap = updatedMonthlyCapValue;
        this._portPlanOutput.valid = currentMonthlyCap !== updatedMonthlyCapValue || this.portSpeed !== this._portPlanOutput.portSpeed;
        break;
    }

    this._portPlanOutput.hasChanged = this._portPlanOutput.valid
      && (this.portSpeed !== this._portPlanOutput.portSpeed
      || currentMonthlyCap !== this._portPlanOutput.monthlyCap);

    // Emit changes
    this.dataChange.emit(this._portPlanOutput);
    this._changeDetectorRef.markForCheck();
  }

  private setMonthlyCapValue(): number {
    if (this.plan === InternetPlan.Unlimited) {
      return this._monthlyCap;
    }

    if (this.inputManageType === InputManageType.Custom) {
      return this.fcCustomMonthlyCap.value;
    }

    return isNullOrEmpty(this.monthlyCapSliderValueIndex) ? 1 : this.monthlyCapSliderValueIndex;
  }

  /**
   * Creates the slider table for port speed slider
   */
  private _createPortSpeedSliderTable(): void {
    // Create table definitions
    let portSpeedScaleTable = new Array<InternetManagePortPlan>();
    let currentPortSpeedIndex = internetPortSpeedSliderDefaultValues.indexOf(this._portSpeed);
    let index = currentPortSpeedIndex !== -1 ? currentPortSpeedIndex : 0;
    let tableSize = internetPortSpeedSliderDefaultValues.length;
    for (index; index < tableSize; index++) {
      let portSpeedScaleItem = {
        portSpeed: internetPortSpeedSliderDefaultValues[index]
      } as InternetManagePortPlan;
      portSpeedScaleTable.push(portSpeedScaleItem);
    }
    this.sliderTable = portSpeedScaleTable;
    this.sliderTableSize = this.sliderTable.length - 1;
  }

  /**
   * Resets the form and change the input to default type
   */
  private _reset(): void {
    this._resetFormGroup();
    this.fcCustomMonthlyCap.setValue(this.monthlyCapMin);
    this.monthlyCapSliderValueIndex = this.monthlyCapMin;
    this.portSpeedSliderValueIndex = this.portSpeedMin;
    this.portSpeedSliderValue = this.sliderTable[this.portSpeedMin].portSpeed;
    this.inputManageType = InputManageType.Auto;
  }

  /**
   * Resets the form group fields
   */
  private _resetFormGroup(): void {
    if (isNullOrEmpty(this.fgInternetPortPlan)) { return; }
    this.fgInternetPortPlan.reset();
    this.fcCustomMonthlyCap.setValue(this.monthlyCapMin);
  }

  /**
   * Creates the form controls table map
   */
  private _createFormControlsMap(): void {
    this._formControlsMap.set(InputManageType.Auto,
      this._registerAutoFormControls.bind(this));

    this._formControlsMap.set(InputManageType.Custom,
      this._registerCustomFormControls.bind(this));
  }

  /**
   * Register form group elements for custom type
   */
  private _registerFormGroup(): void {
    // Register custom monthly cap
    this.fcCustomMonthlyCap = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.monthlyCapMin)(control),
      (control) => CoreValidators.max(this.monthlyCapMax)(control)
    ]);

    // Create form group and bind the form controls
    this.fgInternetPortPlan = this._formBuilder.group([]);
    this.fgInternetPortPlan.statusChanges.pipe(
      startWith(null as string),
      takeUntil(this._destroySubject)
    ).subscribe(() => this.notifyDataChange());
    this._registerFormControlsByInputType();
  }

  /**
   * Registers form controls based on the associated settings
   */
  private _registerFormControlsByInputType(): void {
    if (isNullOrUndefined(this.inputManageType)) { return; }

    let formControlsFunc = this._formControlsMap.get(this.inputManageType);
    if (isNullOrEmpty(formControlsFunc)) {
      throw new Error(`Invalid input manage type ${this.inputManageType}`);
    }
    formControlsFunc.call(this);
  }

  /**
   * Registers auto settings associated form controls
   */
  private _registerAutoFormControls(): void {
    this.fgInternetPortPlan.removeControl('fcCustomMonthlyCap');
  }

  /**
   * Registers custom settings associated form controls
   */
  private _registerCustomFormControls(): void {
    this.fgInternetPortPlan.setControl('fcCustomMonthlyCap', this.fcCustomMonthlyCap);
  }

  /**
   * Subscribe to touched state of the form group
   */
  private _subscribeToFormTouchedState(): void {
    this._formGroup.touchedStateChanges().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }
}