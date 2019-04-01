import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { DashboardComponent } from './dashboard.component';
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
