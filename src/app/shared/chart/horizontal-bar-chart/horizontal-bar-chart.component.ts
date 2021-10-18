import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartItem } from '@app/shared';
import { isNullOrEmpty } from '@app/utilities';

import {
  ChartData,
  ChartDataService
} from '../chart-data.service';
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
  @Input()
  public set data(value: ChartItem[]) {
    if (isNullOrEmpty(value)) {
      return;
    }

    let data: ChartData = this.chartDataService.convertToApexChartData(value);

    this.xaxis = {
      categories: data.categories
    };
    this.series = data.series;

    this.updateChart();
  }

  public constructor(
    chartDataService: ChartDataService,
    changeDetector: ChangeDetectorRef,
    route: ActivatedRoute,
  ) {
    super(chartDataService, changeDetector, route);
  }

  public ngOnInit(): void {
    this._setDefaultOptions();
  }

  private _setDefaultOptions(): void {
    this.legend = {
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 0,
    }

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
      },
      dropShadow: {
        top: 1,
        left: 1,
        blur: 0,
        color: '#000',
        opacity: 0.45
      }
    };
  }
}
