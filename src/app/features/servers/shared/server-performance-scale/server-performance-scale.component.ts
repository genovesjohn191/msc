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
import { ServerPerformanceScale } from '../../models';
import { refreshView } from '../../../../utilities';

export enum ScaleType {
  Slider = 0,
  Custom = 1
}

@Component({
  selector: 'mcs-server-performance-scale',
  styles: [require('./server-performance-scale.component.scss')],
  templateUrl: './server-performance-scale.component.html',
  animations: [
    trigger('fadeInOut', [
      state('*', style({ opacity: 1 })),
      state('void', style({ opacity: 0 })),
      transition('void <=> *', animate('500ms'))
    ])
  ]
})
export class ServerPerformanceScaleComponent implements OnInit {
  public minimum: number;
  public maximum: number;
  public scaleType: ScaleType;
  public scaleTypeEnum = ScaleType;

  public sliderValue: number;
  public sliderTable: ServerPerformanceScale[];

  public customMemoryInGbValue: any;
  public customMemoryInGbTable: McsList;

  public customCpuCountValue: any;
  public customCpuCountTable: McsList;

  @Input()
  public title: string;

  @Input()
  public subtitle: string;

  @Input()
  public memoryInMb: number;

  @Input()
  public cpuCount: number;

  @Input()
  public availableMemoryInMb: number;

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
    this.memoryInMb = 0;
    this.cpuCount = 0;
    this.availableMemoryInMb = 0;
    this.availableCpuCount = 0;
    this.sliderTable = new Array();
    this.scaleType = ScaleType.Slider;
    this.scaleChanged = new EventEmitter();
    this.customMemoryInGbTable = new McsList();
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
    this._notifyCpuSizeScale(this.sliderTable[index].memoryInGb, this.sliderTable[index].cpuCount);
  }

  public onMemoryChanged(value: number) {
    this.customMemoryInGbValue = value;
    this._notifyCpuSizeScale(this.customMemoryInGbValue, this.customCpuCountValue);
  }

  public onCpuCountChanged(value: number) {
    this.customCpuCountValue = value;
    this._notifyCpuSizeScale(this.customMemoryInGbValue, this.customCpuCountValue);
  }

  public onChangeScaleType(scaleType: ScaleType) {
    refreshView(() => { this.scaleType = scaleType; });
  }

  private _setMinMaxValue(): void {
    if (this.sliderTable) {
      this.minimum = 0;
      this.maximum = this.sliderTable.length - 1;
    }
  }

  private _setSliderValue(): void {
    let actualMemory = this.memoryInMb / CoreDefinition.GB_TO_MB_MULTIPLIER;

    // Get slider current value based on table preferences
    for (let index = 0; index < this.sliderTable.length; ++index) {
      if (this.sliderTable[index].cpuCount === this.cpuCount &&
        this.sliderTable[index].memoryInGb === actualMemory) {
        this.sliderValue = index;
        break;
      }
    }
  }

  private _setScaleType(): void {
    // Memory comparison if its not exact value on GB
    let actualMemory = this.memoryInMb / CoreDefinition.GB_TO_MB_MULTIPLIER;
    if (this.getMemoryInGb(this.memoryInMb) !== actualMemory) {
      this.sliderValue = 0;
      this.scaleType = ScaleType.Custom;
      return;
    }

    // Check if the value of Memory and Core are in the table list
    if (this.sliderValue === -1) {
      this.sliderValue = 0;
      this.scaleType = ScaleType.Custom;
    } else {
      this.scaleType = ScaleType.Slider;
    }
  }

  private _setDefaultCustomSizeTable(): void {
    // Populate memory in gigabytes default table
    this.customMemoryInGbTable.push('RAM', new McsListItem('2', '2'));
    this.customMemoryInGbTable.push('RAM', new McsListItem('4', '4'));
    this.customMemoryInGbTable.push('RAM', new McsListItem('8', '8'));
    this.customMemoryInGbTable.push('RAM', new McsListItem('16', '16'));
    this.customMemoryInGbTable.push('RAM', new McsListItem('32', '32'));

    // Populate cpu count default table
    this.customCpuCountTable.push('CPU Count', new McsListItem('1', '1'));
    this.customCpuCountTable.push('CPU Count', new McsListItem('2', '2'));
    this.customCpuCountTable.push('CPU Count', new McsListItem('4', '4'));
    this.customCpuCountTable.push('CPU Count', new McsListItem('8', '8'));
  }

  private _setDefaultSliderTable(): void {
    // Add the table definition
    this.sliderTable.push({ memoryInGb: 2, cpuCount: 1 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryInGb: 4, cpuCount: 2 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryInGb: 8, cpuCount: 4 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryInGb: 16, cpuCount: 4 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryInGb: 24, cpuCount: 4 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryInGb: 32, cpuCount: 4 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryInGb: 16, cpuCount: 8 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryInGb: 24, cpuCount: 8 } as ServerPerformanceScale);
    this.sliderTable.push({ memoryInGb: 32, cpuCount: 8 } as ServerPerformanceScale);
  }

  private _notifyCpuSizeScale(memoryInGb: number, cpuCount: number) {
    let customServerScale: ServerPerformanceScale = new ServerPerformanceScale();

    customServerScale.cpuCount = memoryInGb;
    customServerScale.memoryInGb = cpuCount;
    this.scaleChanged.next(customServerScale);
  }
}
