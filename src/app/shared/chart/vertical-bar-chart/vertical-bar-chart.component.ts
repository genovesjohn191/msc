import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  OnInit,
  Input
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { ChartDataService } from '../chart-data.service';
import { ChartComponentBase } from '../core/chart-base.component';

@Component({
  selector: 'mcs-vertical-bar-chart',
  templateUrl: '../core/chart-base.component.html',
  styleUrls: ['../chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'vertical-bar-chart-component'
  }
})

export class VerticalBarChartComponent extends ChartComponentBase implements OnInit {
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
    this.chart = {
      type: 'bar',
      stacked: this.stacked,
      height: isNullOrEmpty(this.height) ? 'auto' : this.height
    };

    this.plotOptions = {
      bar: {
        barHeight: '100%',
        horizontal: false,
        dataLabels: {
          position: 'top'
        },
        distributed: this.distributed
      }
    };

    this.dataLabels = {
      enabled: this.enableDataLabels,
      offsetY: 0,
      style: {
        fontSize: '10px',
        colors: ['#fff']
      }
    };
  }
}
