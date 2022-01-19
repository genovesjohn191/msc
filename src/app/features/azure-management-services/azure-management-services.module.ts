import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';
import {
  azureManagementServicesRoutes,
  azureManagementServicesProviders
} from './azure-management-services.constants';

/** Azure Management Services */
import { AzureManagementServicesComponent } from './azure-management-services.component';
import {
  AzureManagementServiceComponent,
  AzureManagementServiceOverviewComponent,
  AzureManagementServiceChildrenComponent
} from './azure-management-service';

@NgModule({
  declarations: [
    AzureManagementServicesComponent,
    AzureManagementServiceComponent,
    AzureManagementServiceOverviewComponent,
    AzureManagementServiceChildrenComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(azureManagementServicesRoutes)
  ],
  providers: [
    ...azureManagementServicesProviders
  ]
})

export class AzureManagementServicesModule { }
