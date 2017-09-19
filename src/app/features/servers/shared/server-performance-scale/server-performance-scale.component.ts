import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  McsTextContentProvider,
  CoreDefinition,
  CoreValidators,
  McsList,
  McsListItem
} from '../../../../core';
import {
  ServerPerformanceScale,
  ServerInputManageType
} from '../../models';
import {
  refreshView,
  replacePlaceholder,
  animateFactory,
  appendUnitSuffix,
  isFormControlValid,
  isNullOrEmpty
} from '../../../../utilities';

@Component({
  selector: 'mcs-server-performance-scale',
  styles: [require('./server-performance-scale.component.scss')],
  templateUrl: './server-performance-scale.component.html',
  animations: [
    animateFactory({ duration: '500ms' })
  ]
})

export class ServerPerformanceScaleComponent implements OnInit {
  public minimum: number;
  public maximum: number;
  public inputManageType: ServerInputManageType;
  public inputManageTypeEnum = ServerInputManageType;
  public serverScalePerformanceTextContent: any;

  public sliderValue: number;
  public sliderTable: ServerPerformanceScale[];

  public customMemoryGBValue: number;
  public customMemoryGBTable: McsList;
  public customCpuCountValue: number;
  public customCpuCountTable: McsList;
  public invalidCustomMemoryMessage: string;
  public invalidCustomCpuMessage: string;

  public serverScaleForm: FormGroup;
  public serverScaleCustomRam: FormControl;
  public serverScaleCustomCpu: FormControl;

  @Input()
  public memoryMB: number;

  @Input()
  public cpuCount: number;

  @Input()
  public availableMemoryMB: number;

  @Input()
  public availableCpuCount: number;

  @Output()
  public scaleChanged: EventEmitter<ServerPerformanceScale>;

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

  public constructor(private _textProvider: McsTextContentProvider) {
    this.minimum = 0;
    this.maximum = 0;
    this.sliderValue = -1;
    this.memoryMB = 0;
    this.cpuCount = 0;
    this.availableMemoryMB = 0;
    this.availableCpuCount = 0;
    this.sliderTable = new Array();
    this.inputManageType = ServerInputManageType.Slider;
    this.customMemoryGBTable = new McsList();
    this.customCpuCountTable = new McsList();
    this.scaleChanged = new EventEmitter();
  }

  public ngOnInit() {
    this.serverScalePerformanceTextContent
      = this._textProvider.content.servers.server.management.performanceScale;

    // Set Invalid messages
    this._setInvalidMessages();

    // Register Form group
    this._registerFormGroup();

    // Set default table values
    this._setDefaultSliderTable();
    this._setDefaultCustomSizeTable();

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

  private _registerFormGroup(): void {
    // Create Custom RAM Control and Register the listener
    this.serverScaleCustomRam = new FormControl('', [
      CoreValidators.required,
      CoreValidators.min(this.memoryMB),
      CoreValidators.numeric,
      CoreValidators.custom(
        this._customRamValidator.bind(this),
        this.invalidCustomMemoryMessage
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
        this._customCpuValidator.bind(this),
        this.invalidCustomCpuMessage
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

  private _customRamValidator(inputValue: any): boolean {
    return inputValue <= this.availableMemoryMB;
  }

  private _customCpuValidator(inputValue: any): boolean {
    return inputValue <= this.availableCpuCount;
  }

  private _setInvalidMessages(): void {
    this.invalidCustomMemoryMessage = replacePlaceholder(
      this.serverScalePerformanceTextContent.validationError.memory,
      'available_memory',
      appendUnitSuffix(this.availableMemoryMB, 'megabyte')
    );

    this.invalidCustomCpuMessage = replacePlaceholder(
      this.serverScalePerformanceTextContent.validationError.cpu,
      'available_cpu',
      appendUnitSuffix(this.availableCpuCount, 'cpu')
    );
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

  private _setDefaultCustomSizeTable(): void {
    // Populate memory in gigabytes default table
    this.customMemoryGBTable.push('RAM', new McsListItem(2048, '2048'));
    this.customMemoryGBTable.push('RAM', new McsListItem(4096, '4096'));
    this.customMemoryGBTable.push('RAM', new McsListItem(8192, '8192'));
    this.customMemoryGBTable.push('RAM', new McsListItem(16384, '16384'));
    this.customMemoryGBTable.push('RAM', new McsListItem(32768, '32768'));

    // Populate cpu count default table
    this.customCpuCountTable.push('CPU Count', new McsListItem(1, '1'));
    this.customCpuCountTable.push('CPU Count', new McsListItem(2, '2'));
    this.customCpuCountTable.push('CPU Count', new McsListItem(4, '4'));
    this.customCpuCountTable.push('CPU Count', new McsListItem(8, '8'));
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
  }

  private _fillValidationMessagePlaceholder(
    message: string,
    placeholder: string,
    value: string
  ): string {
    return message.replace(`{{${placeholder}}}`, value);
  }

  private _validateScaleValues(scale: ServerPerformanceScale): boolean {
    return (scale.memoryMB >= this.memoryMB && scale.memoryMB <= this.availableMemoryMB)
      && (scale.cpuCount >= this.cpuCount && scale.cpuCount <= this.availableCpuCount);
  }
}
