import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  OnInit,
  Input
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { ChartDataService, PieChartData } from '../chart-data.service';
import { ChartComponentBase } from '../core/chart-base.component';

@Component({
  selector: 'mcs-pie-chart',
  templateUrl: '../core/chart-base.component.html',
  styleUrls: ['../chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'pie-chart-component'
  }
})

export class PieChartComponent extends ChartComponentBase implements OnInit {

  @Input()
  public set data(value: number[]) {
    if (isNullOrEmpty(value)) {
      return;
    }

    let data: PieChartData = this.chartDataService.convertToPieApexChartData(value);

    this.series = data.series;

    this.updateChart();
  }

  public constructor(
    chartDataService: ChartDataService,
    changeDetector: ChangeDetectorRef
  ) {
    super(chartDataService, changeDetector);
  }

  public ngOnInit(): void {
    this._setDefaultOptions();
  }

  private _setDefaultOptions(): void {
    this.legend = {
      position: 'right'
    };

    this.plotOptions = {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              showAlways: true,
              show: true
            }
          }
        }
      }
    };
  }
}
