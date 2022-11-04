import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportWidgetModule } from '@app/features-shared';
import { FormFieldsModule } from '@app/features-shared/form-fields/form-fields.module';
import { SharedModule } from '@app/shared';

import { AzureVirtualDesktopComponent } from './azure-virtual-desktop.component';
import {
  avdProviders,
  avdRoutes
} from './azure-virtual-desktop.constants';
import { DailyConnectionServiceComponent } from './daily-connection-service/daily-connection.component';
import { DailyUserAverageComponent } from './daily-user-average/daily-user-average.component';
import { DailyUserServiceComponent } from './daily-user-service/daily-user-service.component';
import { ServiceCostComponent } from './service-cost/service-cost.component';

@NgModule({
  declarations: [
    AzureVirtualDesktopComponent,
    DailyUserServiceComponent,
    DailyUserAverageComponent,
    ServiceCostComponent,
    DailyConnectionServiceComponent
  ],
  imports: [
    SharedModule,
    ReportWidgetModule,
    FormFieldsModule,
    RouterModule.forChild(avdRoutes)
  ],
  providers: [
    ...avdProviders
  ]
})

export class AzureVirtualDesktopModule { }
