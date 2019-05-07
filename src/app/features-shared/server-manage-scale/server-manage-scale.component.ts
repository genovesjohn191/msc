import {
  Component,
  OnInit,
  DoCheck,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit
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
  isNullOrEmpty,
  animateFactory,
  unsubscribeSubject,
  getSafeProperty,
  convertMbToGb,
  isNullOrUndefined,
  coerceNumber
} from '@app/utilities';
import {
  CoreValidators,
  IMcsFormGroup,
  IMcsDataChange
} from '@app/core';

import {
  InputManageType,
  McsResource,
  McsServerCompute,
  serviceTypeText
} from '@app/models';
import { ServerManageScale } from './server-manage-scale';
import { McsFormGroupDirective } from '@app/shared';

// Constants definition
const DEFAULT_MEMORY_STEP = 2;
const DEFAULT_CPU_STEP = 2;
const DEFAULT_MIN_MEMORY = 2;
const DEFAULT_MIN_CPU = 2;

@Component({
  selector: 'mcs-server-manage-scale',
  templateUrl: 'server-manage-scale.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ]
})

export class ServerManageScaleComponent
  implements OnInit, DoCheck, AfterViewInit, OnDestroy, IMcsFormGroup, IMcsDataChange<ServerManageScale> {

  public inputManageType: InputManageType;
  public sliderValueIndex: number;
  public sliderValue: ServerManageScale;
  public sliderTable: ServerManageScale[];

  // Forms control
  public fgServerScale: FormGroup;
  public fcCustomMemory: FormControl;
  public fcCustomCpu: FormControl;

  @Output()
  public dataChange = new EventEmitter<ServerManageScale>();

  @Input()
  public resource: McsResource;

  @Input()
  public serverCompute?: McsServerCompute;

  @Input()
  public get minimumCpu(): number { return this._minimumCpu; }
  public set minimumCpu(value: number) {
    this._minimumCpu = coerceNumber(value, DEFAULT_MIN_CPU);
  }

  @Input()
  public get minimumMemoryGB(): number { return this._minimumMemoryGB; }
  public set minimumMemoryGB(value: number) {
    this._minimumMemoryGB = coerceNumber(value, DEFAULT_MIN_MEMORY);
  }

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();
  private _scaleOutput = new ServerManageScale();
  private _formControlsMap = new Map<InputManageType, () => void>();
  private _previousResourceAvailable = 0;
  private _minimumCpu: number = DEFAULT_MIN_CPU;
  private _minimumMemoryGB: number = DEFAULT_MIN_MEMORY;

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

  public ngDoCheck() {
    if (this._previousResourceAvailable !== this.resourceAvailableMemoryGB) {
      this._createSliderTable();
      this._reset();
      this._previousResourceAvailable = this.resourceAvailableMemoryGB;
    }
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._subscribeToFormTouchedState();
    });
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
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
    return getSafeProperty(this.fgServerScale, (obj) => obj.valid);
  }

  /**
   * Returns the service type as string
   */
  public get serviceType(): string {
    let serviceType = getSafeProperty(this.resource, (obj) => obj.serviceType, '');
    return !isNullOrUndefined(serviceType) ? serviceTypeText[serviceType] : '';
  }

  /**
   * Returns the server input managetype enumeration instance
   */
  public get inputManageTypeEnum(): any {
    return InputManageType;
  }

  /**
   * Returns the default cpu step
   */
  public get cpuStep(): number {
    return DEFAULT_CPU_STEP;
  }

  /**
   * Returns the default memory step
   */
  public get memoryStep(): number {
    return DEFAULT_MEMORY_STEP;
  }

  /**
   * Returns the current server memory used
   */
  public get serverMemoryUsedGB(): number {
    return getSafeProperty(this.serverCompute,
      (obj) => convertMbToGb(obj.memoryMB), DEFAULT_MIN_MEMORY);
  }

  /**
   * Returns the server cpu used
   */
  public get serverCpuUsed(): number {
    return getSafeProperty(this.serverCompute,
      (obj) => obj.cpuCount, DEFAULT_MIN_CPU);
  }

  /**
   * Returns the resource available memory in GB
   */
  public get resourceAvailableMemoryGB(): number {
    let resourceMemory = getSafeProperty(this.resource,
      (obj) => convertMbToGb(obj.compute.memoryAvailableMB), 0);
    return resourceMemory + this.serverMemoryUsedGB;
  }

  /**
   * Returns the resource available CPU
   */
  public get resourceAvailableCpu(): number {
    let resourceCpu = getSafeProperty(this.resource,
      (obj) => obj.compute.cpuAvailable, 0);
    return resourceCpu + this.serverCpuUsed;
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
        this._scaleOutput.valid = this.fgServerScale.valid;
        break;

      case InputManageType.Auto:
      default:
        this._scaleOutput.memoryGB = this.sliderValue.memoryGB;
        this._scaleOutput.cpuCount = this.sliderValue.cpuCount;
        this._scaleOutput.valid = true;
        break;
    }
    this._scaleOutput.hasChanged = this._scaleOutput.valid
      && (this.serverCpuUsed !== this._scaleOutput.cpuCount
        || this.serverMemoryUsedGB !== this._scaleOutput.memoryGB);

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
    // TODO: remove and uncomment once slider is enabled
    this.onChangeInputManageType(InputManageType.Custom);
    // this.inputManageType = InputManageType.Custom;
  }

  /**
   * Resets the form group fields
   */
  private _resetFormGroup(): void {
    if (isNullOrEmpty(this.fgServerScale)) { return; }
    this.fgServerScale.reset();
    this.fcCustomCpu.setValue(this.serverCpuUsed);
    this.fcCustomMemory.setValue(this.serverMemoryUsedGB);
  }

  /**
   * Creates the slider table for slider
   */
  private _createSliderTable(): void {
    // Create table definitions
    let table = new Array<ServerManageScale>();
    table.push({ memoryGB: 2, cpuCount: 2 } as ServerManageScale);
    table.push({ memoryGB: 4, cpuCount: 2 } as ServerManageScale);
    table.push({ memoryGB: 8, cpuCount: 4 } as ServerManageScale);
    table.push({ memoryGB: 16, cpuCount: 4 } as ServerManageScale);
    table.push({ memoryGB: 24, cpuCount: 4 } as ServerManageScale);
    table.push({ memoryGB: 32, cpuCount: 4 } as ServerManageScale);
    table.push({ memoryGB: 64, cpuCount: 8 } as ServerManageScale);
    table.push({ memoryGB: 128, cpuCount: 8 } as ServerManageScale);
    table.push({ memoryGB: 256, cpuCount: 8 } as ServerManageScale);

    // Filter applicable values on the table
    this.sliderTable = table.filter((scale) => {
      return (scale.memoryGB >= this.minimumMemoryGB
        && scale.memoryGB <= this.resourceAvailableMemoryGB)
        && (scale.cpuCount >= this.minimumCpu
          && scale.cpuCount <= this.resourceAvailableCpu);
    });
    if (isNullOrEmpty(this.sliderTable)) {
      this.sliderTable.push({
        memoryGB: this.minimumMemoryGB,
        cpuCount: this.minimumCpu
      } as ServerManageScale);
      this.sliderTable.push({
        memoryGB: this.resourceAvailableMemoryGB,
        cpuCount: this.resourceAvailableCpu
      } as ServerManageScale);
    }
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
      CoreValidators.custom(this._memoryCanScaleDown.bind(this), 'scaleDown'),
      (control) => CoreValidators.min(DEFAULT_MIN_MEMORY)(control),
      (control) => CoreValidators.max(this.resourceAvailableMemoryGB)(control),
      CoreValidators.custom(this._memoryStepIsValid.bind(this), 'memoryStep')
    ]);

    // Register custom CPU
    this.fcCustomCpu = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      CoreValidators.custom(this._cpuCanScaleDown.bind(this), 'scaleDown'),
      (control) => CoreValidators.min(DEFAULT_MIN_CPU)(control),
      (control) => CoreValidators.max(this.resourceAvailableCpu)(control),
      CoreValidators.custom(this._cpuStepIsValid.bind(this), 'cpuStep')
    ]);

    // Create form group and bind the form controls
    this.fgServerScale = this._formBuilder.group([]);
    this.fgServerScale.statusChanges
      .pipe(startWith(null), takeUntil(this._destroySubject))
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
    this.fgServerScale.removeControl('fcCustomMemory');
    this.fgServerScale.removeControl('fcCustomCpu');
  }

  /**
   * Registers custom settings associated form controls
   */
  private _registerCustomFormControls(): void {
    this.fgServerScale.setControl('fcCustomMemory', this.fcCustomMemory);
    this.fgServerScale.setControl('fcCustomCpu', this.fcCustomCpu);
  }

  /**
   * Returns true if the value is a valid memory step
   * @param inputValue Value to be checked
   */
  private _memoryStepIsValid(inputValue: any) {
    return inputValue % DEFAULT_MEMORY_STEP === 0;
  }

  /**
   * Returns true if the value is a valid CPU step
   * @param inputValue Value to be checked
   */
  private _cpuStepIsValid(inputValue: any) {
    return inputValue % DEFAULT_CPU_STEP === 0;
  }

  /**
   * Returns true if new value is allowed to be lower than the current cpu value.
   * @param inputValue Value to be checked
   */
  private _cpuCanScaleDown(inputValue: any) {
    let minimumSameAsDefaultMinimum = DEFAULT_MIN_CPU === this.minimumCpu;
    return minimumSameAsDefaultMinimum ? minimumSameAsDefaultMinimum : inputValue >= this.minimumCpu;
  }

  /**
   * Returns true if new value is allowed to be lower than the current memory value.
   * @param inputValue Value to be checked
   */
  private _memoryCanScaleDown(inputValue: any) {
    let minimumSameAsDefaultMinimum = DEFAULT_MIN_MEMORY === this.minimumMemoryGB;
    return minimumSameAsDefaultMinimum ? minimumSameAsDefaultMinimum : inputValue >= this.minimumMemoryGB;
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
