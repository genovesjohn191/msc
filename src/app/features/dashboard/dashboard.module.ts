import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
/** Components */
import { DashboardComponent } from './dashboard.component';
/** Providers List */
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
