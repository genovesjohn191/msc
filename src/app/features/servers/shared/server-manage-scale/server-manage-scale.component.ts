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
  coerceBoolean,
  convertMbToGb,
  isNullOrUndefined
} from '@app/utilities';
import {
  McsTextContentProvider,
  CoreValidators,
  IMcsFormGroup
} from '@app/core';
import {
  InputManageType,
  McsResource,
  McsServerCompute
} from '@app/models';
import { ServerManageScale } from './server-manage-scale';
import { McsFormGroupDirective } from '@app/shared';

// Constants definition
const DEFAULT_MB = 1024;
const DEFAULT_MEMORY_MULTIPLIER = 2;
const DEFAULT_CPU_MULTIPLIER = 2;
const DEFAULT_MIN_MEMORY = 2048;
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
  implements OnInit, DoCheck, AfterViewInit, OnDestroy, IMcsFormGroup {

  public textContent: any;
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
  public get allowScaleDown(): boolean { return this._allowScaleDown; }
  public set allowScaleDown(value: boolean) {
    this._allowScaleDown = coerceBoolean(value);
  }
  private _allowScaleDown: boolean;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();
  private _scaleOutput = new ServerManageScale();
  private _formControlsMap = new Map<InputManageType, () => void>();
  private _previousResourceAvailable = 0;

  constructor(
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
    this._createFormControlsMap();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.shared.manageScale;
    this._registerFormGroup();
    this._createSliderTable();
    this._reset();
  }

  public ngDoCheck() {
    if (this._previousResourceAvailable !== this.resourceAvailableMemoryMB) {
      this._createSliderTable();
      this._reset();
      this._previousResourceAvailable = this.resourceAvailableMemoryMB;
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
   * Returns the server input managetype enumeration instance
   */
  public get inputManageTypeEnum(): any {
    return InputManageType;
  }

  /**
   * Returns the minimum memory MB used
   */
  public get minimumMemoryMB(): number {
    return this.allowScaleDown ? DEFAULT_MIN_MEMORY : this.serverMemoryUsedMB;
  }

  /**
   * Returns the minimum cpu used
   */
  public get minimumCpuUsed(): number {
    return this.allowScaleDown ? DEFAULT_MIN_CPU : this.serverCpuUsed;
  }

  /**
   * Returns the current server memory used
   */
  public get serverMemoryUsedMB(): number {
    return getSafeProperty(this.serverCompute,
      (obj) => obj.memoryMB, DEFAULT_MIN_MEMORY);
  }

  /**
   * Returns the server cpu used
   */
  public get serverCpuUsed(): number {
    return getSafeProperty(this.serverCompute,
      (obj) => obj.cpuCount * obj.coreCount, DEFAULT_MIN_CPU);
  }

  /**
   * Returns the resource available memory in MB
   */
  public get resourceAvailableMemoryMB(): number {
    let resourceMemory = getSafeProperty(this.resource,
      (obj) => obj.compute.memoryAvailableMB, 0);
    return resourceMemory + this.serverMemoryUsedMB;
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
    this._notifyDataChanged();
  }

  /**
   * Event that emits when the slider value has changed
   * @param index Slider value as index
   */
  public onSliderChanged(index: number) {
    this.sliderValueIndex = index;
    this.sliderValue = this.sliderTable[this.sliderValueIndex];
    this._notifyDataChanged();
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
    if (isNullOrEmpty(this.fgServerScale)) { return; }
    this.fgServerScale.reset();
    this.fcCustomCpu.setValue(this.serverCpuUsed);
    this.fcCustomMemory.setValue(convertMbToGb(this.serverMemoryUsedMB));
  }

  /**
   * Creates the slider table for slider
   */
  private _createSliderTable(): void {
    // Create table definitions
    let table = new Array<ServerManageScale>();
    let baseMB = DEFAULT_MB;
    table.push({ memoryMB: baseMB * 2, cpuCount: 2 } as ServerManageScale);
    table.push({ memoryMB: baseMB * 4, cpuCount: 2 } as ServerManageScale);
    table.push({ memoryMB: baseMB * 8, cpuCount: 4 } as ServerManageScale);
    table.push({ memoryMB: baseMB * 16, cpuCount: 4 } as ServerManageScale);
    table.push({ memoryMB: baseMB * 24, cpuCount: 4 } as ServerManageScale);
    table.push({ memoryMB: baseMB * 32, cpuCount: 4 } as ServerManageScale);
    table.push({ memoryMB: baseMB * 64, cpuCount: 8 } as ServerManageScale);
    table.push({ memoryMB: baseMB * 128, cpuCount: 8 } as ServerManageScale);
    table.push({ memoryMB: baseMB * 256, cpuCount: 8 } as ServerManageScale);

    // Filter applicable values on the table
    this.sliderTable = table.filter((scale) => {
      return (scale.memoryMB >= this.minimumMemoryMB
        && scale.memoryMB <= this.resourceAvailableMemoryMB)
        && (scale.cpuCount >= this.minimumCpuUsed
          && scale.cpuCount <= this.resourceAvailableCpu);
    });
    if (isNullOrEmpty(this.sliderTable)) {
      this.sliderTable.push({
        memoryMB: this.resourceAvailableMemoryMB,
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
      (control) => CoreValidators.min(convertMbToGb(this.minimumMemoryMB))(control),
      (control) => CoreValidators.max(convertMbToGb(this.resourceAvailableMemoryMB))(control),
      CoreValidators.numeric,
      CoreValidators.custom(
        this._memoryInvalidValidator.bind(this),
        'memoryInvalid'
      )
    ]);

    // Register custom CPU
    this.fcCustomCpu = new FormControl('', [
      CoreValidators.required,
      CoreValidators.min(this.minimumCpuUsed),
      CoreValidators.max(this.resourceAvailableCpu),
      CoreValidators.numeric,
      CoreValidators.custom(
        this._cpuInvalidValidator.bind(this),
        'cpuInvalid'
      )
    ]);

    // Create form group and bind the form controls
    this.fgServerScale = this._formBuilder.group([]);
    this.fgServerScale.statusChanges
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => this._notifyDataChanged());
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
   * Returns true when the inputted memory is valid
   * @param inputValue Value to be checked
   */
  private _memoryInvalidValidator(inputValue: any) {
    return inputValue % DEFAULT_MEMORY_MULTIPLIER === 0;
  }

  /**
   * Returns true when the inputted cpu is valid
   * @param inputValue Value to be checked
   */
  private _cpuInvalidValidator(inputValue: any) {
    return inputValue % DEFAULT_CPU_MULTIPLIER === 0;
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
   * Event that emits when an input has been changed
   */
  private _notifyDataChanged() {
    let hasNoScaleContent = isNullOrEmpty(this.sliderValue) || isNullOrEmpty(this._scaleOutput);
    if (hasNoScaleContent) { return; }

    // Set model data based on management type
    switch (this.inputManageType) {
      case InputManageType.Custom:
        this._scaleOutput.memoryMB = +this.fcCustomMemory.value * DEFAULT_MB;
        this._scaleOutput.cpuCount = +this.fcCustomCpu.value;
        this._scaleOutput.valid = this.fgServerScale.valid;
        break;

      case InputManageType.Auto:
      default:
        this._scaleOutput.memoryMB = this.sliderValue.memoryMB;
        this._scaleOutput.cpuCount = this.sliderValue.cpuCount;
        this._scaleOutput.valid = true;
        break;
    }
    this._scaleOutput.hasChanged = this._scaleOutput.valid
      && (this.serverCpuUsed !== this._scaleOutput.cpuCount
        || this.serverMemoryUsedMB !== this._scaleOutput.memoryMB);

    // Emit changes
    this.dataChange.emit(this._scaleOutput);
    this._changeDetectorRef.markForCheck();
  }
}
