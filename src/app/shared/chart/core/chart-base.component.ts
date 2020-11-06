import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  Input
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
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
  ApexTitleSubtitle,
  ApexTooltip
} from 'ng-apexcharts';
import { ChartData, ChartDataService } from '../chart-data.service';
import { ChartItem } from '../chart-item.interface';

export type ChartDataLabels = {
  enabled?: boolean;
  formatter?: (val: number, opts?: any) => string | number;
}

export type ChartXAxis = {
  showLabel?: boolean;
  title?: string;
  valueFormatter?: (val: string, timestamp?: number) => string | string[];
}

export type ChartYAxis = {
  showLabel?: boolean;
  title?: string;
  valueFormatter?: (val: number, opts?: any) => string;
}

export type ChartLegend = {
  formatter?: (val: string, opts?: any) => string;
}

export type ChartTooltip = {
  yTitleFormatter?:  (seriesName: string) => string;
  yValueFormatter?: (val: number, opts?: any) => string;
  xValueFormatter?: (val: number, opts?: any) => string;
}

export type ChartConfig = {
  data?: ChartItem[];
  height?: string;
  stacked?: boolean;
  dataLabels?: ChartDataLabels;
  xaxis?: ChartXAxis;
  yaxis?: ChartYAxis;
  legend?: ChartLegend;
  tooltip?: ChartTooltip;
}

type ChartOptions = {
  chart: ApexChart;
  colors?: string[];
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  series: ApexAxisChartSeries;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
};

@Component({
  selector: 'mcs-chart-base',
  templateUrl: './chart-base.component.html',
  styleUrls: ['../chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'char-base-component'
  }
})

export class ChartComponentBase {
  @Input()
  public distributed: boolean;

  @Input()
  public set data(value: ChartItem[]) {
    if (isNullOrEmpty(value)) {
      return;
    }

    let data: ChartData = this._chartDataService.convertToApexChartData(value);

    this.xaxis = {
      categories: data.categories
    };
    this.series = data.series;

    this.updateChart();
  }

  @Input()
  public set config(value: ChartConfig) {
    if (isNullOrEmpty(value) || JSON.stringify(value) === JSON.stringify(this._config)) {
      return;
    }

    this._config = value;

    this.chart = {
      type: 'bar',
      stacked: value.stacked,
      height: isNullOrEmpty(value.height) ? 'auto' : value.height
    };

    if (!isNullOrEmpty(value.xaxis)) {
      this.xaxis = {
        title: {
          text: value.xaxis.title ?? ''
        },
        labels: {
          show: value.xaxis.showLabel ?? true,
          formatter: value.xaxis.valueFormatter
        }
      };
    }

    if (!isNullOrEmpty(value.yaxis)) {
      this.yaxis = {
        title: {
          text: value.yaxis.title ?? ''
        },
        labels: {
          show: value.yaxis.showLabel,
          formatter: value.yaxis.valueFormatter
        }
      };
    }

    if (!isNullOrEmpty(value.dataLabels)) {
      this.dataLabels = {
        enabled: value.dataLabels.enabled,
        formatter: value.dataLabels.formatter
      };
    }

    if (!isNullOrEmpty(value.legend)) {
      this.legend = {
        formatter: value.legend.formatter
      };
    }

    if (!isNullOrEmpty(value.tooltip)) {
      this.tooltip = {
        x: {
          formatter: value.tooltip.xValueFormatter
        },
        y: {
          formatter: value.tooltip.yValueFormatter,
          title: {
            formatter: value.tooltip.yTitleFormatter
          }
        }
      }
    }

    this.updateChart();
  }

  @ViewChild('chartObject', { static: true })
  public chartObject: ChartComponent;
  public get options(): Partial<ChartOptions> {
    let config = {
      chart: this._chart,
      series: this._series,
      xaxis: this._xaxis,
      yaxis: this._yaxis,
      dataLabels: this._dataLabels,
      plotOptions: this._plotOptions,
      stroke: this._stroke,
      legend: this._legend,
      title: this._title,
      tooltip: this._tooltip
    };

    return config;
  }

  public get hasData(): boolean {
    return !isNullOrEmpty(this._series);
  }

  public set chart(value: ApexChart) {
    this._chart = {...this._chart, ...value};
  }

  public set dataLabels(value: ApexDataLabels) {
    this._dataLabels = {...this._dataLabels, ...value};
  }

  public set legend(value: ApexLegend) {
    this._legend = {...this._legend, ...value};
  }

  public set plotOptions(value: ApexPlotOptions) {
    this._plotOptions = {...this._plotOptions, ...value};
  }

  public set series(value: ApexAxisChartSeries) {
    this._series = value;
  }

  public set stroke(value: ApexStroke) {
    this._stroke = {...this._stroke, ...value};
  }

  public set title(value: ApexTitleSubtitle) {
    this._title = {...this._title, ...value};
  }

  public set tooltip(value: ApexTooltip) {
    this._tooltip = {...this._tooltip, ...value};
  }

  public set xaxis(value: ApexXAxis) {
    this._xaxis = {...this._xaxis, ...value};
  }

  public set yaxis(value: ApexYAxis) {
    this._yaxis = {...this._yaxis, ...value};
  }

  private _config: ChartConfig;

  private _chart: ApexChart = {
    type: 'bar',
    height: 'auto',
    animations: {
      speed: 10,
      animateGradually: {
        enabled: false
      },
      dynamicAnimation: {
        enabled: true,
        speed: 10
      }
    }
  };

  protected colors = {};

  private _dataLabels: ApexDataLabels = {
    enabled: false,
    offsetX: 0,
    textAnchor: 'start',
    style: {
      fontSize: '11px',
      colors: ['#fff']
    }
  };

  private _legend: ApexLegend = {
    position: 'top',
    horizontalAlign: 'left',
    offsetX: 0
  };

  private _plotOptions: ApexPlotOptions;
  private _series: ApexAxisChartSeries = [];
  private _stroke: ApexStroke;
  private _title: ApexTitleSubtitle;
  private _tooltip: ApexTooltip = {
    theme: 'dark',
  };
  private _xaxis: ApexXAxis = {};
  private _yaxis: ApexYAxis = {};

  public updateChart(): void {
    this._changeDetectorRef.markForCheck();
  }

  public constructor(
    private _chartDataService: ChartDataService,
    private _changeDetectorRef: ChangeDetectorRef) {}
}
