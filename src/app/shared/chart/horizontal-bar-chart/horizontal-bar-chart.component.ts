import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { ChartDataService } from '../chart-data.service';
import { ChartComponentBase } from '../core/chart-base.component';

@Component({
  selector: 'mcs-horizontal-bar-chart',
  templateUrl: '../core/chart-base.component.html',
  styleUrls: ['../chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'horizontal-bar-chart-component'
  }
})

export class HorizontalBarChartComponent extends ChartComponentBase implements OnInit {
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
      type: 'bar'
    };

    this.plotOptions = {
      bar: {
        barHeight: '85%',
        horizontal: true,
        dataLabels: {
          position: 'bottom'
        },
        distributed: this.distributed
      }
    };

    this.dataLabels = {
      offsetX: 0,
      style: {
        fontSize: '10px',
        colors: ['#333']
      }
    };
  }
}
