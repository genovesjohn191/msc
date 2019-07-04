import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';

import {
  maintenacePageProviders,
  maintenacePageRoutes
} from './maintenance-page.constants';
import { MaintenancePageComponent } from './maintenance-page.component';

@NgModule({
  declarations: [
    MaintenancePageComponent
  ],
  providers: maintenacePageProviders,
  imports: [
    SharedModule,
    RouterModule.forChild(maintenacePageRoutes)
  ]
})

export class MaintenancePageModule { }
