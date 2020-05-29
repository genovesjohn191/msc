import {
  Component,
  OnInit,
  AfterViewInit,
  Output,
  OnDestroy,
  Input,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  EventEmitter
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import { Subject } from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  animateFactory,
  coerceNumber,
  getSafeProperty,
  isNullOrUndefined,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import {
  IMcsFormGroup,
  IMcsDataChange,
  CoreValidators
} from '@app/core';
import { InputManageType } from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { VdcManageScale } from './vdc-manage-scale';

// Constants definition
const DEFAULT_STEP_MEMORY = 16;
const DEFAULT_STEP_CPU = 2;
const DEFAULT_RATIO_MEMORY = 8;
const DEFAULT_RATIO_CPU = 1;
const DEFAULT_MIN_MEMORY = 8;
const DEFAULT_MIN_CPU = 1;
const MAX_CPU = 348;
const MAX_MEMORY = 2784;
const DEFAULT_SLIDER_STEP = 2;

@Component({
  selector: 'mcs-vdc-manage-scale',
  templateUrl: 'vdc-manage-scale.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ]
})

export class VdcManageScaleComponent
  implements OnInit, AfterViewInit, OnDestroy, IMcsFormGroup, IMcsDataChange<VdcManageScale> {

  public inputManageType: InputManageType;
  public sliderValueIndex: number;
  public sliderValue: VdcManageScale;
  public sliderTable: VdcManageScale[];

  // Forms control
  public fgVdcScale: FormGroup;
  public fcCustomMemory: FormControl;
  public fcCustomCpu: FormControl;

  @Output()
  public dataChange = new EventEmitter<VdcManageScale>();

  @Input()
  public get initialCpu(): number { return this._initialCpu; }
  public set initialCpu(value: number) {
    this._initialCpu = coerceNumber(value, 0);
  }

  @Input()
  public get initialMemoryGB(): number { return this._initialMemoryGB; }
  public set initialMemoryGB(value: number) {
    this._initialMemoryGB = coerceNumber(value, 0);
  }

  @ViewChild(McsFormGroupDirective, { static: false })
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();
  private _scaleOutput = new VdcManageScale();
  private _formControlsMap = new Map<InputManageType, () => void>();
  private _initialCpu: number = 0;
  private _initialMemoryGB: number = 0;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder
  ) {
    this._createFormControlsMap();
  }

  public ngOnInit() {
    this._registerFormGroup();
    this._createSliderTable();
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

  /**
   * Returns the form group
   */
  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Returns true when the form group is valid
   */
  public isValid(): boolean {
    return getSafeProperty(this.fgVdcScale, (obj) => obj.valid);
  }

  /**
   * Returns the input managetype enumeration instance
   */
  public get inputManageTypeEnum(): any {
    return InputManageType;
  }

  /**
   * Returns the available ram in GB
   */
  public get ramAvailableGB(): number {
    return this.ramMax - this.initialMemoryGB;
  }

  /**
   * Returns the available CPU
   */
  public get cpuAvailable(): number {
    return this.cpuMax - this.initialCpu;
  }

  /**
   * Returns the default memory step
   */
  public get ramStep(): number {
    return DEFAULT_STEP_MEMORY;
  }

  /**
   * Returns the default cpu step
   */
  public get cpuStep(): number {
    return DEFAULT_STEP_CPU;
  }

  /**
   * Returns the default memory ratio
   */
  public get ramRatio(): number {
    return DEFAULT_RATIO_MEMORY;
  }

  /**
   * Returns the default cpu ratio
   */
  public get cpuRatio(): number {
    return DEFAULT_RATIO_CPU;
  }

  /**
   * Returns max CPU that can be scaled on a vdc
   */
  public get cpuMax(): number {
    return MAX_CPU;
  }

  /**
   * Returns max RAM that can be scaled on a vdc
   */
  public get ramMax(): number {
    return MAX_MEMORY;
  }

  /**
   * Returns the default step value used on the slider
   */
  public get sliderStep(): number {
    return DEFAULT_SLIDER_STEP;
  }

  /**
   * Returns min CPU that can be scaled on a vdc
   */
  public get cpuMin(): number {
    let isHigherThanDefaultMin = this.initialCpu > DEFAULT_MIN_CPU;
    return isHigherThanDefaultMin ?
      this._roundUpToNearestStep(this.initialCpu, DEFAULT_STEP_CPU) : DEFAULT_MIN_CPU;
  }

  /**
   * Returns min RAM that can be scaled on a vdc
   */
  public get ramMin(): number {
    let isHigherThanDefaultMin = this.initialMemoryGB > DEFAULT_MIN_MEMORY;
    return isHigherThanDefaultMin ?
      this._roundUpToNearestStep(this.initialMemoryGB, DEFAULT_STEP_MEMORY) : DEFAULT_MIN_CPU;
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
   * Event that emits when the slider value has changed
   * @param index Slider value as index
   */
  public onSliderChanged(index: number) {
    this.sliderValueIndex = index;
    this.sliderValue = this.sliderTable[this.sliderValueIndex];
    this.notifyDataChange();
  }

  /**
   * Event that emits when the ram is change
   */
  public onRamChange(): void {
    if (isNullOrEmpty(this.fcCustomCpu)) { return; }
    let suggestedCpuCount: number = +this.fcCustomMemory.value / DEFAULT_RATIO_MEMORY;
    this.fcCustomCpu.setValue(suggestedCpuCount);
    this.fcCustomCpu.updateValueAndValidity();
    this.fcCustomMemory.updateValueAndValidity();
  }

  /**
   * Event that emits when the cpu is change
   */
  public onCpuChange(): void {
    if (isNullOrEmpty(this.fcCustomMemory)) { return; }
    let suggestedRamInGB: number = +this.fcCustomCpu.value * DEFAULT_RATIO_MEMORY;
    this.fcCustomMemory.setValue(suggestedRamInGB);
    this.fcCustomMemory.updateValueAndValidity();
    this.fcCustomCpu.updateValueAndValidity();
  }

  /**
   * Event that emits when an input has been changed
   */
  public notifyDataChange() {
    let hasNoScaleContent = isNullOrEmpty(this.sliderValue) || isNullOrEmpty(this._scaleOutput);
    if (hasNoScaleContent) { return; }

    // Set model data based on management type
    switch (this.inputManageType) {
      case InputManageType.Custom:
        this._scaleOutput.memoryGB = +this.fcCustomMemory.value;
        this._scaleOutput.cpuCount = +this.fcCustomCpu.value;
        this._scaleOutput.valid = this.fgVdcScale.valid;
        break;

      case InputManageType.Auto:
      default:
        this._scaleOutput.memoryGB = this.sliderValue.memoryGB;
        this._scaleOutput.cpuCount = this.sliderValue.cpuCount;
        this._scaleOutput.valid = true;
        break;
    }
    this._scaleOutput.hasChanged = this._scaleOutput.valid
      && (this.initialCpu !== this._scaleOutput.cpuCount
        || this.initialMemoryGB !== this._scaleOutput.memoryGB);

    // Emit changes
    this.dataChange.emit(this._scaleOutput);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Resets the form and change the input to default type
   */
  private _reset(): void {
    this._resetFormGroup();
    this.sliderValueIndex = 0;
    this.sliderValue = this.sliderTable[this.sliderValueIndex];
    this.inputManageType = InputManageType.Auto;
  }

  /**
   * Resets the form group fields
   */
  private _resetFormGroup(): void {
    if (isNullOrEmpty(this.fgVdcScale)) { return; }
    this.fgVdcScale.reset();
    this.fcCustomCpu.setValue(this.initialCpu);
    this.fcCustomMemory.setValue(this.initialMemoryGB);
  }

  /**
   * Creates the slider table for slider
   */
  private _createSliderTable(): void {
    // Create table definitions
    let tableSize = MAX_CPU - this.initialCpu;
    let vdcScaleTable = new Array<VdcManageScale>();

    for (let cpu = this.initialCpu; cpu < tableSize; cpu++) {
      let vdcManageScaleItem = {
        cpuCount: cpu,
        memoryGB: cpu * this.ramRatio
      } as VdcManageScale;
      vdcScaleTable.push(vdcManageScaleItem);
    }
    this.sliderTable = vdcScaleTable;
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
    // Register custom memory
    this.fcCustomMemory = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.ramMin)(control),
      (control) => CoreValidators.max(this.ramMax)(control),
      (control) => CoreValidators.custom(this._ramRatioIsValid.bind(this), 'ramRatio')(control),
      (control) => CoreValidators.custom(this._ramStepIsValid.bind(this), 'ramStep')(control)
    ]);

    // Register custom CPU
    this.fcCustomCpu = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.cpuMin)(control),
      (control) => CoreValidators.max(this.cpuMax)(control),
      (control) => CoreValidators.custom(this._cpuRatioIsValid.bind(this), 'cpuRatio')(control),
      (control) => CoreValidators.custom(this._cpuStepIsValid.bind(this), 'cpuStep')(control)
    ]);

    // Create form group and bind the form controls
    this.fgVdcScale = this._formBuilder.group([]);
    this.fgVdcScale.statusChanges
      .pipe(startWith(null as string), takeUntil(this._destroySubject))
      .subscribe(() => this.notifyDataChange());
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
    this.fgVdcScale.removeControl('fcCustomMemory');
    this.fgVdcScale.removeControl('fcCustomCpu');
  }

  /**
   * Registers custom settings associated form controls
   */
  private _registerCustomFormControls(): void {
    this.fgVdcScale.setControl('fcCustomMemory', this.fcCustomMemory);
    this.fgVdcScale.setControl('fcCustomCpu', this.fcCustomCpu);
  }

  /**
   * Returns true if the value is a valid memory step
   * @param inputValue Value to be checked
   */
  private _ramStepIsValid(inputValue: any): boolean {
    return inputValue % DEFAULT_STEP_MEMORY === 0;
  }

  /**
   * Returns true if the value is a valid CPU step
   * @param inputValue Value to be checked
   */
  private _cpuStepIsValid(inputValue: any): boolean {
    return inputValue % DEFAULT_STEP_CPU === 0;
  }

  /**
   * Returns true if the memory value inputted have the correct ratio with the cpu
   * @param inputValue Value to be checked
   */
  private _ramRatioIsValid(inputValue: any): boolean {
    let inputtedCpu = getSafeProperty(this.fcCustomCpu, (obj) => obj.value);
    if (isNullOrEmpty(inputtedCpu)) { return false; }

    return inputValue / inputtedCpu === DEFAULT_RATIO_MEMORY;
  }

  /**
   * Returns true if the cpu value inputted have the correct ratio with the memory
   * @param inputValue Value to be checked
   */
  private _cpuRatioIsValid(inputValue: any): boolean {
    let inputtedMemory = getSafeProperty(this.fcCustomMemory, (obj) => obj.value);
    if (isNullOrEmpty(inputtedMemory)) { return false; }

    return inputtedMemory / inputValue === DEFAULT_RATIO_MEMORY;
  }

  /**
   * Subscribe to touched state of the form group
   */
  private _subscribeToFormTouchedState(): void {
    this._formGroup.touchedStateChanges().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }

  /**
   * Round up the value to the nearest step passed
   * @param value value to be rounded up
   * @param step step which where the value should be rounded up on
   */
  private _roundUpToNearestStep(value: number, step: number): number {
    return Math.ceil(value / step) * step;
  }
}
