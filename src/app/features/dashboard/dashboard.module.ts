import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { DashboardComponent } from './dashboard.component';
import {
  dashboardProviders,
  dashboardRoutesComponents
} from './dashboard.constants';

@NgModule({
  entryComponents: [
    ...dashboardRoutesComponents
  ],
  declarations: [
    DashboardComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...dashboardProviders
  ]
})

export class DashboardModule { }
