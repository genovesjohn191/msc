import { NgModule } from '@angular/core';
import { ChartDataService } from './chart-data.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { StatusMessageModule } from '../status-message/status-message.module';
import { HorizontalBarChartComponent } from './horizontal-bar-chart/horizontal-bar-chart.component';
import { VerticalBarChartComponent } from './vertical-bar-chart/vertical-bar-chart.component';
import { ChartComponentBase } from './core/chart-base.component';

@NgModule({
  imports: [
    NgApexchartsModule,
    StatusMessageModule
  ],
  declarations: [
    ChartComponentBase,
    HorizontalBarChartComponent,
    VerticalBarChartComponent,
  ],
  exports: [
    HorizontalBarChartComponent,
    VerticalBarChartComponent,
  ],
  providers: [
    ChartDataService,
  ]
})
export class ChartModule { }
