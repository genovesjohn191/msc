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
  McsAssetsProvider,
  CoreDefinition,
  McsList,
  McsListItem
} from '../../../../core';
import {
  ServerPerformanceScale,
  ServerInputManageType
} from '../../models';
import {
  refreshView,
  animateFactory
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

  public sliderValue: number;
  public sliderTable: ServerPerformanceScale[];

  public customMemoryGBValue: any;
  public customMemoryGBTable: McsList;

  public customCpuCountValue: any;
  public customCpuCountTable: McsList;

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
    return this.sliderValue < 0 ? undefined : this.sliderTable[this.sliderValue];
  }

  public constructor() {
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
    this.customMemoryGBTable = new McsList();
    this.customCpuCountTable = new McsList();
  }

  public ngOnInit() {
    // Set default table values
    this._setDefaultSliderTable();
    this._setDefaultCustomSizeTable();

    // Set the minimum and maximum value of the progressbar based on the inputted data
    this._setMinMaxValue();

    // Set the slider value based on the table definition list
    this._setSliderValue();

    // Set the scale type based on the slider value and scale type
    this._setScaleType();
  }

  public getMemoryInGb(memoryInMb: number) {
    return Math.trunc(memoryInMb / CoreDefinition.GB_TO_MB_MULTIPLIER);
  }

  public onSliderChanged(index: number) {
    // Get Slider index value
    this.sliderValue = index;
    this._notifyCpuSizeScale(this.sliderTable[index].memoryGB, this.sliderTable[index].cpuCount);
  }

  public onMemoryChanged(value: number) {
    this.customMemoryGBValue = value;
    this._notifyCpuSizeScale(this.customMemoryGBValue, this.customCpuCountValue);
  }

  public onCpuCountChanged(value: number) {
    this.customCpuCountValue = value;
    this._notifyCpuSizeScale(this.customMemoryGBValue, this.customCpuCountValue);
  }

  public onChangeInputManageType(inputManageType: ServerInputManageType) {
    refreshView(() => { this.inputManageType = inputManageType; });
  }

  private _setMinMaxValue(): void {
    if (this.sliderTable) {
      this.minimum = 0;
      this.maximum = this.sliderTable.length - 1;
    }
  }

  private _setSliderValue(): void {
    let actualMemory = this.memoryMB / CoreDefinition.GB_TO_MB_MULTIPLIER;

    // Get slider current value based on table preferences
    for (let index = 0; index < this.sliderTable.length; ++index) {
      if (this.sliderTable[index].cpuCount === this.cpuCount &&
        this.sliderTable[index].memoryGB === actualMemory) {
        this.sliderValue = index;
        break;
      }
    }
  }

  private _setScaleType(): void {
    // Memory comparison if its not exact value on GB
    let actualMemory = this.memoryMB / CoreDefinition.GB_TO_MB_MULTIPLIER;
    if (this.getMemoryInGb(this.memoryMB) !== actualMemory) {
      this.sliderValue = 0;
      this.inputManageType = ServerInputManageType.Custom;
      return;
    }

    // Check if the value of Memory and Core are in the table list
    if (this.sliderValue === -1) {
      this.sliderValue = 0;
      this.inputManageType = ServerInputManageType.Custom;
    } else {
      this.inputManageType = ServerInputManageType.Slider;
    }
  }

  private _setDefaultCustomSizeTable(): void {
    // Populate memory in gigabytes default table
    this.customMemoryGBTable.push('RAM', new McsListItem('2', '2'));
    this.customMemoryGBTable.push('RAM', new McsListItem('4', '4'));
    this.customMemoryGBTable.push('RAM', new McsListItem('8', '8'));
    this.customMemoryGBTable.push('RAM', new McsListItem('16', '16'));
    this.customMemoryGBTable.push('RAM', new McsListItem('32', '32'));

    // Populate cpu count default table
    this.customCpuCountTable.push('CPU Count', new McsListItem('1', '1'));
    this.customCpuCountTable.push('CPU Count', new McsListItem('2', '2'));
    this.customCpuCountTable.push('CPU Count', new McsListItem('4', '4'));
    this.customCpuCountTable.push('CPU Count', new McsListItem('8', '8'));
  }

  private _setDefaultSliderTable(): void {
    // Add the table definition
    this.sliderTable.push({ memoryGB: 2, cpuCount: 1 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryGB: 4, cpuCount: 2 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryGB: 8, cpuCount: 4 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryGB: 16, cpuCount: 4 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryGB: 24, cpuCount: 4 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryGB: 32, cpuCount: 4 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryGB: 16, cpuCount: 8 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryGB: 24, cpuCount: 8 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryGB: 32, cpuCount: 8 } as ServerPerformanceScale);
  }

  private _notifyCpuSizeScale(memoryGB: number, cpuCount: number) {
    let performanceScale: ServerPerformanceScale = new ServerPerformanceScale();

    performanceScale.memoryGB = memoryGB;
    performanceScale.cpuCount = cpuCount;
    this.scaleChanged.next(performanceScale);
  }
}
