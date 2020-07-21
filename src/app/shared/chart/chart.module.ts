import { NgModule } from '@angular/core';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { ChartDataService } from './chart-data.service';

@NgModule({
  imports: [],
  declarations: [
    BarChartComponent
  ],
  exports: [BarChartComponent],
  providers: [
    ChartDataService
  ]
})
export class ChartModule { }
