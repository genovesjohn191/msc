import { NgModule } from '@angular/core';
import { ChartDataService } from './chart-data.service';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  imports: [ NgApexchartsModule ],
  declarations: [
    BarChartComponent
  ],
  exports: [
    BarChartComponent
  ],
  providers: [
    ChartDataService,
  ]
})
export class ChartModule { }
