import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  McsTextContentProvider,
  CoreDefinition,
  CoreValidators
} from '../../../../core';
import {
  ServerPerformanceScale,
  ServerInputManageType
} from '../../models';
import {
  refreshView,
  replacePlaceholder,
  appendUnitSuffix,
  isFormControlValid,
  isNullOrEmpty,
  coerceNumber
} from '../../../../utilities';

const CUSTOM_MEMORY_MULTIPLE = 4;

@Component({
  selector: 'mcs-server-performance-scale',
  styleUrls: ['./server-performance-scale.component.scss'],
  templateUrl: './server-performance-scale.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class ServerPerformanceScaleComponent implements OnInit {
  public minimum: number;
  public maximum: number;
  public inputManageType: ServerInputManageType;
  public inputManageTypeEnum = ServerInputManageType;
  public textContent: any;

  public sliderTable: ServerPerformanceScale[];

  public customMemoryGBValue: number;
  public customCpuCountValue: number;
  public invalidCustomMemoryMaxValueMessage: string;
  public invalidCustomMemoryValueMessage: string;
  public invalidCustomCpuMaxValueMessage: string;

  public serverScaleForm: FormGroup;
  public serverScaleCustomRam: FormControl;
  public serverScaleCustomCpu: FormControl;

  @Output()
  public scaleChanged: EventEmitter<ServerPerformanceScale>;

  @Input()
  public get memoryMB(): number { return this._memoryMB; }
  public set memoryMB(value: number) { this._memoryMB = coerceNumber(value); }
  private _memoryMB: number;

  @Input()
  public get cpuCount(): number { return this._cpuCount; }
  public set cpuCount(value: number) { this._cpuCount = coerceNumber(value); }
  private _cpuCount: number;

  @Input()
  public get availableMemoryMB(): number { return this._availableMemoryMB; }
  public set availableMemoryMB(value: number) { this._availableMemoryMB = coerceNumber(value); }
  private _availableMemoryMB: number;

  @Input()
  public get availableCpuCount(): number { return this._availableCpuCount; }
  public set availableCpuCount(value: number) { this._availableCpuCount = coerceNumber(value); }
  private _availableCpuCount: number;

  private _sliderValue: number;
  public get sliderValue(): number {
    return this._sliderValue;
  }
  public set sliderValue(value: number) {
    this._sliderValue = value;
    this._changeDetectorRef.markForCheck();
  }

  public get currentServerScale(): ServerPerformanceScale {
    return this.sliderValue < 0 || !(this.sliderTable.length > 0) ?
      { memoryMB: 0, cpuCount: 0 } as ServerPerformanceScale :
      this.sliderTable[this.sliderValue];
  }

  public get remainingMemoryMB(): number {
    return this.availableMemoryMB - this.currentServerScale.memoryMB;
  }

  public get remainingCpuCount(): number {
    return this.availableCpuCount - this.currentServerScale.cpuCount;
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.minimum = 0;
    this.maximum = 0;
    this.sliderValue = -1;
    this.memoryMB = 0;
    this.cpuCount = 0;
    this.availableMemoryMB = 0;
    this.availableCpuCount = 0;
    this.sliderTable = new Array();
    this.inputManageType = ServerInputManageType.Slider;
    this.scaleChanged = new EventEmitter();
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.shared.performanceScale;

    // Set Invalid messages
    this._setInvalidMessages();

    // Register Form group
    this._registerFormGroup();

    // Set default table values
    this._setDefaultSliderTable();

    // Set the minimum and maximum value of the progressbar based on the inputted data
    this._setMinMaxValue();

    // Set the initial slider value
    // in case there is no corresponding slider value on the table
    // the size is a custom
    this._setInitialSliderValue();

    // Set the scale type based on the slider value and scale type
    this._setScaleType();

    // Set the custom size
    this._setInitialCustomSizeValue();
  }

  public onSliderChanged(index: number) {
    // Get Slider index value
    this.sliderValue = index;
    this._notifyCpuSizeScale();
  }

  public onMemoryChanged(inputValue: number) {
    this.customMemoryGBValue = inputValue;
    this._notifyCpuSizeScale();
  }

  public onCpuCountChanged(inputValue: number) {
    this.customCpuCountValue = inputValue;
    this._notifyCpuSizeScale();
  }

  public onChangeInputManageType(inputManageType: ServerInputManageType) {
    refreshView(() => {
      if (this.sliderValue < 0) { this.sliderValue = 0; }
      this.inputManageType = inputManageType;
      this._notifyCpuSizeScale();
    });
  }

  public isControlValid(control: FormControl): boolean {
    return isFormControlValid(control);
  }

  public get ramMinValueText(): string {
    return replacePlaceholder(
      this.textContent.errors.ramMin,
      'min_value',
      this.memoryMB.toString()
    );
  }

  public get cpuMinValueText(): string {
    return replacePlaceholder(
      this.textContent.errors.cpuMin,
      'min_value',
      this.cpuCount.toString()
    );
  }

  private _registerFormGroup(): void {
    // Create Custom RAM Control and Register the listener
    this.serverScaleCustomRam = new FormControl('', [
      CoreValidators.required,
      CoreValidators.min(this.memoryMB),
      CoreValidators.numeric,
      CoreValidators.custom(
        this._customRamValidatorAcceptableValue.bind(this),
        'invalidRam'
      ),
      CoreValidators.custom(
        this._customRamValidatorMaxValue.bind(this),
        'maxRamError'
      )
    ]);
    this.serverScaleCustomRam.valueChanges
      .subscribe(this.onMemoryChanged.bind(this));

    // Create Custom CPU Control and Register the listener
    this.serverScaleCustomCpu = new FormControl('', [
      CoreValidators.required,
      CoreValidators.min(this.cpuCount),
      CoreValidators.numeric,
      CoreValidators.custom(
        this._customCpuValidatorMaxValue.bind(this),
        'maxCpuError'
      )
    ]);
    this.serverScaleCustomCpu.valueChanges
      .subscribe(this.onCpuCountChanged.bind(this));

    // Bind server scale form control to the main form
    this.serverScaleForm = new FormGroup({
      serverScaleCustomRam: this.serverScaleCustomRam,
      serverScaleCustomCpu: this.serverScaleCustomCpu
    });
  }

  private _setInvalidMessages(): void {
    this.invalidCustomMemoryMaxValueMessage = replacePlaceholder(
      this.textContent.errors.ramMax,
      'available_memory',
      appendUnitSuffix(this.availableMemoryMB, 'megabyte')
    );

    this.invalidCustomMemoryValueMessage = replacePlaceholder(
      this.textContent.errors.ramInvalid,
      'multiple',
      CUSTOM_MEMORY_MULTIPLE.toString()
    );

    this.invalidCustomCpuMaxValueMessage = replacePlaceholder(
      this.textContent.errors.cpuMax,
      'available_cpu',
      appendUnitSuffix(this.availableCpuCount, 'cpu')
    );
  }

  private _setDefaultSliderTable(): void {
    // Add the table definition
    let table = new Array<ServerPerformanceScale>();
    table.push({ memoryMB: 2048, cpuCount: 1 } as ServerPerformanceScale);
    table.push({ memoryMB: 4096, cpuCount: 2 } as ServerPerformanceScale);
    table.push({ memoryMB: 8192, cpuCount: 4 } as ServerPerformanceScale);
    table.push({ memoryMB: 16384, cpuCount: 4 } as ServerPerformanceScale);
    table.push({ memoryMB: 24576, cpuCount: 4 } as ServerPerformanceScale);
    table.push({ memoryMB: 32768, cpuCount: 4 } as ServerPerformanceScale);
    table.push({ memoryMB: 16384, cpuCount: 8 } as ServerPerformanceScale);
    table.push({ memoryMB: 24576, cpuCount: 8 } as ServerPerformanceScale);
    table.push({ memoryMB: 32768, cpuCount: 8 } as ServerPerformanceScale);

    table.forEach((scale) => {
      if (this._validateScaleValues(scale)) {
        this.sliderTable.push(scale);
      }
    });
  }

  private _setMinMaxValue(): void {
    if (this.sliderTable) {
      this.minimum = 0;
      this.maximum = this.sliderTable.length - 1;
    }
  }

  private _setInitialSliderValue(): void {
    let actualMemory = this.memoryMB;

    // Get slider current value based on table preferences
    if (this.cpuCount <= 0 && this.memoryMB <= 0) {
      this.cpuCount = undefined;
      this.memoryMB = undefined;
      this.sliderValue = 0;
    } else {
      for (let index = 0; index < this.sliderTable.length; ++index) {
        if (this.sliderTable[index].cpuCount === this.cpuCount &&
          this.sliderTable[index].memoryMB === actualMemory) {
          this.sliderValue = index;
          break;
        }
      }
    }

    // Notify subscribers
    if (this.sliderValue >= 0) {
      this.onSliderChanged(this.sliderValue);
    }
  }

  private _setInitialCustomSizeValue(): void {
    this.customMemoryGBValue = this.memoryMB;
    this.customCpuCountValue = this.cpuCount;

    // Notify subscribers
    if (this.inputManageType === ServerInputManageType.Custom) {
      this.onMemoryChanged(this.customMemoryGBValue);
      this.onCpuCountChanged(this.customCpuCountValue);
    }
  }

  private _setScaleType(): void {
    // Check if the value of Memory and Core are in the table list
    if (!this.cpuCount && !this.memoryMB) {
      this.inputManageType = ServerInputManageType.Slider;
    } else if (this.sliderValue === -1) {
      this.inputManageType = ServerInputManageType.Custom;
    }
  }

  private _notifyCpuSizeScale() {
    let performanceScale: ServerPerformanceScale = new ServerPerformanceScale();

    // Set model data based on management type
    switch (this.inputManageType) {
      case ServerInputManageType.Custom:
        performanceScale.memoryMB = this.customMemoryGBValue;
        performanceScale.cpuCount = this.customCpuCountValue;
        performanceScale.valid = this.serverScaleCustomCpu.valid && this.serverScaleCustomRam.valid;
        break;

      case ServerInputManageType.Slider:
      default:
        if (!isNullOrEmpty(this.sliderTable)) {
          performanceScale.memoryMB = this.sliderTable[this.sliderValue].memoryMB;
          performanceScale.cpuCount = this.sliderTable[this.sliderValue].cpuCount;
          performanceScale.valid = true;
        } else {
          performanceScale.valid = false;
        }
        break;
    }
    refreshView(() => {
      this.scaleChanged.next(performanceScale);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);

    this._changeDetectorRef.markForCheck();
  }

  private _customRamValidatorMaxValue(inputValue: any): boolean {
    return inputValue <= this.availableMemoryMB;
  }

  private _customRamValidatorAcceptableValue(inputValue: any): boolean {
    return inputValue % CUSTOM_MEMORY_MULTIPLE === 0;
  }

  private _customCpuValidatorMaxValue(inputValue: any): boolean {
    return inputValue <= this.availableCpuCount;
  }

  private _validateScaleValues(scale: ServerPerformanceScale): boolean {
    return (scale.memoryMB >= this.memoryMB && scale.memoryMB <= this.availableMemoryMB)
      && (scale.cpuCount >= this.cpuCount && scale.cpuCount <= this.availableCpuCount);
  }
}
