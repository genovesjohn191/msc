import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormControl
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
  getSafeProperty
} from '../../../../utilities';
import {
  McsTextContentProvider,
  CoreValidators
} from '../../../../core';
import {
  ServerManageScale,
  ServerResource,
  ServerInputManageType,
  ServerComputeSummary
} from '../../models';
import { ServersService } from '../../servers.service';

// Constants definition
const DEFAULT_MB = 1024;
const DEFAULT_MEMORY_MULTIPLIER = 2048;
const DEFAULT_CPU_MULTIPLIER = 2;

@Component({
  selector: 'mcs-server-manage-scale',
  templateUrl: 'server-manage-scale.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'server-manage-scale-wrapper block block-items-medium'
  }
})

export class ServerManageScaleComponent implements OnInit, OnChanges, OnDestroy {
  public textContent: any;
  public inputManageType: ServerInputManageType;
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
  public resource: ServerResource;

  @Input()
  public serverCompute?: ServerComputeSummary;

  private _destroySubject = new Subject<void>();
  private _scaleOutput = new ServerManageScale();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _serversService: ServersService
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.shared.manageScale;
    this._registerFormGroup();
    this._createSliderTable();
    this._reset();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let resourceChange = changes['resource'];
    let computChange = changes['compute'];
    if (!isNullOrEmpty(resourceChange) || !isNullOrEmpty(computChange)) {
      this._createSliderTable();
      this._reset();
    }
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns the server input managetype enumeration instance
   */
  public get inputManageTypeEnum(): any {
    return ServerInputManageType;
  }

  /**
   * Returns the current server memory used
   */
  public get serverMemoryUsedMB(): number {
    return getSafeProperty(this.serverCompute, (obj) => obj.memoryMB, 0);
  }

  /**
   * Returns the server cpu used
   */
  public get serverCpuUsed(): number {
    return getSafeProperty(this.serverCompute,
      (obj) => obj.cpuCount * obj.coreCount, 0);
  }

  /**
   * Returns the resource available memory in MB
   */
  public get resourceAvailableMemoryMB(): number {
    let calculatedResourceMemory = this._serversService.computeAvailableMemoryMB(this.resource);
    return calculatedResourceMemory + this.serverMemoryUsedMB;
  }

  /**
   * Returns the resource available CPU
   */
  public get resourceAvailableCpu(): number {
    let calculatedResourceCpu = this._serversService.computeAvailableCpu(this.resource);
    return calculatedResourceCpu + this.serverCpuUsed;
  }

  /**
   * Event that emits when the input manage type has been changed
   */
  public onChangeInputManageType(inputManageType: ServerInputManageType) {
    this.inputManageType = inputManageType;
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
    this.inputManageType = ServerInputManageType.Slider;
  }

  /**
   * Resets the form group fields
   */
  private _resetFormGroup(): void {
    if (isNullOrEmpty(this.fgServerScale)) { return; }
    this.fgServerScale.reset();
    this.fcCustomCpu.setValue(this.serverCpuUsed);
    this.fcCustomMemory.setValue(this.serverMemoryUsedMB);
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
      return (scale.memoryMB >= this.serverMemoryUsedMB
        && scale.memoryMB <= this.resourceAvailableMemoryMB)
        && (scale.cpuCount >= this.serverCpuUsed
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
   * Register form group elements for custom type
   */
  private _registerFormGroup(): void {
    // Create custom storage control and register the listener
    this.fcCustomMemory = new FormControl('', [
      CoreValidators.required,
      CoreValidators.min(this.serverMemoryUsedMB),
      CoreValidators.max(this.resourceAvailableMemoryMB),
      CoreValidators.numeric,
      CoreValidators.custom(
        this._memoryInvalidValidator.bind(this),
        'memoryInvalid'
      )
    ]);

    this.fcCustomCpu = new FormControl('', [
      CoreValidators.required,
      CoreValidators.min(this.serverCpuUsed),
      CoreValidators.max(this.resourceAvailableCpu),
      CoreValidators.numeric,
      CoreValidators.custom(
        this._cpuInvalidValidator.bind(this),
        'cpuInvalid'
      )
    ]);

    // Create form group and bind the form controls
    this.fgServerScale = new FormGroup({
      fcCustomMemory: this.fcCustomMemory,
      fcCustomCpu: this.fcCustomCpu,
    });

    // Notify data changed for every changes made in the status
    this.fgServerScale.statusChanges
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => this._notifyDataChanged());
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
   * Event that emits when an input has been changed
   */
  private _notifyDataChanged() {
    // Set model data based on management type
    switch (this.inputManageType) {
      case ServerInputManageType.Custom:
        this._scaleOutput.memoryMB = +this.fcCustomMemory.value;
        this._scaleOutput.cpuCount = +this.fcCustomCpu.value;
        this._scaleOutput.valid = this.fgServerScale.valid;
        break;

      case ServerInputManageType.Slider:
      default:
        this._scaleOutput.memoryMB = this.sliderValue.memoryMB;
        this._scaleOutput.cpuCount = this.sliderValue.cpuCount;
        this._scaleOutput.valid = true;
        break;
    }
    this._scaleOutput.hasChanged = this.serverCpuUsed !== this._scaleOutput.cpuCount
      || this.serverMemoryUsedMB !== this._scaleOutput.memoryMB;

    // Emit changes
    this.dataChange.emit(this._scaleOutput);
    this._changeDetectorRef.markForCheck();
  }
}
