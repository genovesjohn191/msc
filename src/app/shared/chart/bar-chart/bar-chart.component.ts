import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    ViewChild,
    ElementRef,
    Input,
    AfterViewInit,
    OnDestroy,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import Chart from 'chart.js';
import { isNullOrEmpty, unsubscribeSafely } from '@app/utilities';
import { ChartItem } from '../chart-item.interface';
import { ChartDataService } from '../chart-data.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'mcs-bar-chart',
    templateUrl: './bar-chart.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
      'class': 'bar-chart-layout-wrapper'
    }
})

export class BarChartComponent implements AfterViewInit, OnChanges {
  @Input()
  public data: ChartItem[];

  @Input()
  public title: string;

  @Input()
  public yLabel: string;

  @Input()
  public xLabel: string;

  @Input()
  public stacked: boolean = false;

  @ViewChild('output', { static: true })
  private _output: ElementRef;

  private _chart: Chart;

  public constructor(private _chartDataService: ChartDataService) { }

  public ngOnChanges(changes: SimpleChanges): void {
    let dataChanges = changes['data'];
    if (!isNullOrEmpty(dataChanges)) {
      this.updateChart(this.data);
    }
  }

  public ngAfterViewInit(): void {
    this.updateChart(this.data);
  }

  private updateChart(value: ChartItem[]): void {
    if (isNullOrEmpty(value)) {
      return;
    }

    if (isNullOrEmpty(this._chart)) {
      this.initializeChart(this._chartDataService.convertToChartData(value));
    } else {
      this._chart.data = this._chartDataService.convertToChartData(value);
      this._chart.update();
    }
  }

  private initializeChart(chartData: any): void {
    let ctx = this._output.nativeElement.getContext('2d');
    this._chart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        title: {
          display: !isNullOrEmpty(this.title),
          text: this.title,
          position: 'top'
        },
        tooltips: {
          mode: 'index',
          intersect: false
        },
        responsive: true,
        scales: {
          xAxes: [{
            stacked: this.stacked,
            scaleLabel : {
              display: !isNullOrEmpty(this.xLabel),
              labelString: this.xLabel,
              fontFamily: 'Circular-Pro-Bold'
            }
          }],
          yAxes: [{
            stacked: this.stacked,
            scaleLabel : {
              display: !isNullOrEmpty(this.yLabel),
              labelString: this.yLabel,
              fontFamily: 'Circular-Pro-Bold'
            }
          }]
        }
      }
    });
  }
}
