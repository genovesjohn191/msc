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

export type ChartOptions = {
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

type dataLabelFormatter =  (val: number, opts?: any) => string | number;

type xAxisLabelsFormatter =  (val: string, timestamp?: number) => string | string[];

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
  public set data(value: ChartItem[]) {
    if (isNullOrEmpty(value)) {
      return;
    }

    let data: ChartData = this._chartDataService.convertToApexChartData(value);

    this.series = data.series;
    this.xaxis = {
      categories: data.categories,
    };

    this.updateChart();
  }

  @Input()
  public height: string;

  @Input()
  public enableDataLabels: boolean = false;

  @Input()
  public distributed: boolean = false;

  @Input()
  public stacked: boolean = false;

  @Input()
  public set dataLabelFormatter(value: dataLabelFormatter) {
    this.dataLabels = {
      formatter: value,
    };
  }

  @Input()
  public set xAxisLabelFormatter(value: xAxisLabelsFormatter) {
    this.xaxis = {
      labels: {
        formatter: value,
      }
    };
  }

  @Input()
  public set yAxisLabelFormatter(value: (val: number, opts?: any) => string) {
    this.yaxis = {
      labels: {
        formatter: value,
      }
    };
  }

  @Input()
  public set legendLabelFormatter(value: (val: string, opts?: any) => string) {
    this.legend = {
      formatter: value,
    };
  }

  @Input()
  public set tooltipYValueFormatter(value: (val: number, opts?: any) => string) {
    this.tooltip = {
      y: {
        formatter: value
      }
    };
  }

  @Input()
  public set tooltipXValueFormatter(value: (val: number, opts?: any) => string) {
    this.tooltip = {
      x: {
        formatter: value
      }
    };
  }

  @Input()
  public set tooltipYTitleFormatter(value: (seriesName: string) => string) {
    this.tooltip = {
      y: {
        title: {
          formatter: value
        }
      }
    };
  }

  @Input()
  public set showDataLabels(value: boolean) {
    this.dataLabels.enabled = value;
  }

  @Input()
  public set hideYAxis(value: boolean) {
    this.yaxis = {
      labels: {
        show: !value
      }
    };
  }

  @Input()
  public set hideXAxis(value: boolean) {
    this.xaxis = {
      labels: {
        show: !value
      }
    };
  }

  @Input()
  public set yAxisLabel(value: string) {
    this.yaxis = {
      title: {
        text: value
      }
    }
  }

  @Input()
  public set xAxisLabel(value: string) {
    this.xaxis = {
      title: {
        text: value
      }
    }
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
