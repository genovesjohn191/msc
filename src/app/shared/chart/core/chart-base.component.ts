import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartComponent,
  ChartType
} from 'ng-apexcharts';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isNullOrEmpty } from '@app/utilities';

import { ChartDataService } from '../chart-data.service';
import { ChartItem } from '../chart-item.interface';

export type ChartDataLabelsStyle = {
  colors?: (opts?: any) => string,
  fontSize?: string,
  fontFamily?: string,
  fontWeight?: string
}

export type ChartDataLabels = {
  enabled?: boolean;
  style?: ChartDataLabelsStyle,
  formatter?: (val: number, opts?: any) => string | number;
  offsetX?: number;
  offsetY?: number;
}

export type ChartXAxis = {
  showLabel?: boolean;
  title?: string;
  format?: string;
  type?: 'category' | 'numeric' | 'datetime';
  valueFormatter?: (val: string, timestamp?: number) => string | string[];
}

export type ChartYAxis = {
  showLabel?: boolean;
  title?: string;
  valueFormatter?: (val: number, opts?: any) => string;
}

export type ChartLegend = {
  position?: 'top' | 'right' | 'bottom' | 'left',
  horizontalAlign?: 'left' | 'center' | 'right',
  offsetX?: number,
  width?: number,
  height?: number,
  formatter?: (val: string, opts?: any) => string;
}

export type ChartTooltip = {
  theme?: 'light' | 'dark';
  yTitleFormatter?: (seriesName: string) => string;
  yValueFormatter?: (val: number, opts?: any) => string;
  xValueFormatter?: (val: number, opts?: any) => string;
  customFormatter?: (options: any) => string;
}

export type ChartPlotOptions = {
  bar: {
    columnWidth?: string;
  }
}

export type ChartConfig = {
  data?: ChartItem[];
  type?: ChartType;
  height?: string;
  stacked?: boolean;
  dataLabels?: ChartDataLabels;
  xaxis?: ChartXAxis;
  yaxis?: ChartYAxis;
  legend?: ChartLegend;
  tooltip?: ChartTooltip;
  labels?: any[];
  colors?: any[];
  plotOptions?: ChartPlotOptions;
}

type ChartOptions = {
  chart: ApexChart;
  colors?: any[];
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  labels: any[];
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

  @Output()
  public chartChange = new EventEmitter<any>();

  @Input()
  public set config(value: ChartConfig) {
    if (isNullOrEmpty(value) || JSON.stringify(value) === JSON.stringify(this._config)) {
      return;
    }

    this.chart = {
      type: value.type,
      stacked: value.stacked,
      events: {
        mounted: () => {
          this.getChartUri();
        }
      },
      height: isNullOrEmpty(value.height) ? 'auto' : value.height,
      toolbar: {
        show: true,
        tools: {
          download: true
        }
      }
    };

    this._config = value;

    if (!isNullOrEmpty(value.xaxis)) {
      this.xaxis = {
        title: {
          text: value.xaxis.title ?? ''
        },
        labels: {
          show: value.xaxis.showLabel ?? true,
          formatter: value.xaxis.valueFormatter,
          format: value.xaxis.format
        },
        type: value.xaxis.type
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
        style: {
          colors: [(opts) => { return '#000' }]
        },
        formatter: value.dataLabels.formatter,
        offsetX: value.dataLabels.offsetX,
        offsetY: value.dataLabels.offsetY
      };
    }

    if (!isNullOrEmpty(value.legend)) {
      this.legend = {
        formatter: value.legend.formatter,
        position: value.legend.position,
        offsetX: value.legend.offsetX,
        horizontalAlign: value.legend.horizontalAlign,
        width: value.legend.width,
        height: value.legend.height
      };
    }

    if (!isNullOrEmpty(value.plotOptions)) {
      this.plotOptions = {
        bar: {
          columnWidth: value.plotOptions?.bar?.columnWidth
        }
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
        },
        custom: value.tooltip.customFormatter,
        theme: value.tooltip.theme || 'light'
      }
    }

    if (!isNullOrEmpty(value.colors)) {
      this.colors = value.colors;
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
      plotOptions: this.plotOptions,
      stroke: this._stroke,
      legend: this.legend,
      title: this._title,
      tooltip: this._tooltip,
      labels: this._labels,
      colors: this._colors
    };

    return config;
  }

  public get hasData(): boolean {
    return !isNullOrEmpty(this._series);
  }

  public set chart(value: ApexChart) {
    this._chart = { ...this._chart, ...value };
  }

  public set dataLabels(value: ApexDataLabels) {
    this._dataLabels = { ...this._dataLabels, ...value };
  }

  public set series(value: ApexAxisChartSeries | ApexNonAxisChartSeries) {
    this._series = value;
  }

  public set stroke(value: ApexStroke) {
    this._stroke = { ...this._stroke, ...value };
  }

  public set title(value: ApexTitleSubtitle) {
    this._title = { ...this._title, ...value };
  }

  public set tooltip(value: ApexTooltip) {
    this._tooltip = { ...this._tooltip, ...value };
  }

  public set xaxis(value: ApexXAxis) {
    this._xaxis = { ...this._xaxis, ...value };
  }

  public set yaxis(value: ApexYAxis) {
    this._yaxis = { ...this._yaxis, ...value };
  }

  public set labels(value: any[]) {
    this._labels = value;
  }

  public set colors(value: any[]) {
    this._colors = value;
  }

  private _config: ChartConfig;

  private _chart: ApexChart = {
    type: 'bar',
    height: 'auto',
    animations: {
      enabled: false
    }
  };

  private _dataLabels: ApexDataLabels = {
    enabled: false,
    offsetX: 0,
    textAnchor: 'start',
    style: {
      fontSize: '11px',
      colors: ['#fff']
    }
  };

  protected legend: ApexLegend;
  protected plotOptions: ApexPlotOptions;
  protected _series: ApexAxisChartSeries | ApexNonAxisChartSeries = [];

  private _stroke: ApexStroke;
  private _title: ApexTitleSubtitle;
  private _labels: any[];
  private _colors: any[];
  private _tooltip: ApexTooltip = {

  };
  private _xaxis: ApexXAxis = {};
  private _yaxis: ApexYAxis = {};

  public updateChart(): void {
    this.changeDetectorRef.markForCheck();
  }

  public getChartUri(): void {
    this.chartObject.dataURI().then((uri) => {
      this.chartChange.emit(uri);
    });
  }

  public constructor(
    protected chartDataService: ChartDataService,
    protected changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute) { }
}
