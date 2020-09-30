import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { ChartItem } from '../chart-item.interface';
import { ChartData, ChartDataService } from '../chart-data.service';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexLegend,
  ApexTitleSubtitle
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'mcs-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['../chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'bar-chart-layout-wrapper'
  }
})

export class BarChartComponent implements OnChanges {
  @Input()
  public data: ChartItem[];

  @Input()
  public dataLabels: boolean = false;

  @Input()
  public isHorizontal: boolean = false;

  @Input()
  public showLegend: boolean = true;

  @Input()
  public title: string;

  @Input()
  public yLabel: string;

  @Input()
  public xLabel: string;

  @Input()
  public yAxisDataFormatter: (val: number, opts?: any) => string;

  @Input()
  public xAxisDataFormatter: (value: string, timestamp?: number) => string;

  @Input()
  public stacked: boolean = false;

  @ViewChild('chart', { static: true }) chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  public hasData: boolean = false;

  public constructor(
    private _chartDataService: ChartDataService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.chartOptions = {
      series: [],
      chart: {
        type: 'bar',
        stacked: this.stacked,
        height: '500px'
      },
      xaxis: {
        categories: [],
        title: {
          text: this.xLabel
        },
        labels: {
          formatter: this.xAxisDataFormatter
        }
      },
      yaxis: {
        title: {
          text: this.yLabel
        },
        labels: {
          formatter: this.yAxisDataFormatter
        }
      },
      plotOptions: {
        bar: {
          horizontal: this.isHorizontal,
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: this.dataLabels,
        offsetX: -6,
        style: {
          fontSize: '11px',
          colors: ['#fff']
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetX: 0
      }
    };
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!isNullOrEmpty(changes['data'])) {
      this.updateApexData(this.data);
    }

    this._changeDetectorRef.markForCheck();
  }

  private updateApexData(value: ChartItem[]): void {
    this.hasData = false;
    if (isNullOrEmpty(value)) {
      return;
    }

    this.hasData = true;
    let data: ChartData = this._chartDataService.convertToApexChartData(value);

    this.chartOptions = {
      series: data.series,
      chart: {
        type: 'bar',
        stacked: this.stacked,
        height: 'auto'
      },
      xaxis: {
        categories: data.categories,
        title: {
          text: this.xLabel
        },
        labels: {
          formatter: this.xAxisDataFormatter
        }
      },
      yaxis: {
        title: {
          text: this.yLabel
        },
        labels: {
          formatter: this.yAxisDataFormatter
        }
      },
      plotOptions: {
        bar: {
          horizontal: this.isHorizontal,
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: this.dataLabels,
        offsetX: -6,
        style: {
          fontSize: '11px',
          colors: ['#fff']
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetX: 40
      }
    };
  }
}
