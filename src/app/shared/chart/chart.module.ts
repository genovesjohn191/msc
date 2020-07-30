import { NgModule } from '@angular/core';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { ChartDataService } from './chart-data.service';
import { BarChart2Component } from './bar-chart2/bar-chart2.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  imports: [ NgApexchartsModule ],
  declarations: [
    BarChartComponent,
    BarChart2Component
  ],
  exports: [
    BarChartComponent,
    BarChart2Component
  ],
  providers: [
    ChartDataService,
  ]
})
export class ChartModule { }
