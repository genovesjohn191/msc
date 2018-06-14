import { NgModule } from '@angular/core';
/** Components */
import { DashboardComponent } from './dashboard.component';
/** Modules */
import { SharedModule } from '../../shared';
/** Providers List */
import { dashboardProviders } from './dashboard.constants';

@NgModule({
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
