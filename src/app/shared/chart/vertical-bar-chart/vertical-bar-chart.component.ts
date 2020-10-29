import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  OnInit
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
      height: isNullOrEmpty(this.height) ? '400px' : this.height
    };

    this.plotOptions = {
      bar: {
        barHeight: '100%',
        horizontal: false,
        dataLabels: {
          position: 'bottom'
        },
        distributed: true
      }
    };

    this.dataLabels = {
      enabled: true,
      offsetY: 0,
      style: {
        fontSize: '10px',
        colors: ['#fff']
      }
    };
  }
}
