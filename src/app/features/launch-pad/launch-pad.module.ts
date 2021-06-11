import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McsStorageService } from '@app/core';
import { DynamicFormModule, FeaturesSharedModule } from '@app/features-shared';
import { ConfirmationDialogComponent, SharedModule } from '@app/shared';

import { LaunchPadWorkflowCoreModule } from './workflows/workflow/workflow-core.module';
import { AzureDeploymentCreateComponent } from './azure-deployments/azure-deployment-create/azure-deployment-create.component';
import { AzureDeploymentsComponent } from './azure-deployments/azure-deployments.component';
/** Components */
import { launchPadRoutes } from './launch-pad.constants';
import { LaunchPadGuard } from './launch-pad.guard';
import { LaunchPadSearchComponent } from './search/launch-pad-search.component';
import { LaunchPadSearchElementsResultComponent } from './search/results-table/elements-result.component';
import { LaunchPadSearchServicesResultComponent } from './search/results-table/services-result.component';
import { LaunchPadWorkflowLaunchComponent } from './workflows/workflow-launch.component';
import { LaunchPadWorkflowsComponent } from './workflows/workflows.component';
import { AzureDeploymentActivitiesComponent } from './azure-deployments/azure-deployment/history/azure-deployment-history.component';
import { AzureDeploymentResolver } from './azure-deployments/azure-deployment/azure-deployment.resolver';
import { AzureDeploymentComponent } from './azure-deployments/azure-deployment/azure-deployment.component';
import { AzureDeploymentOverviewComponent } from './azure-deployments/azure-deployment/overview/azure-deployment-overview.component';
import { AzureDeploymentService } from './azure-deployments/azure-deployment/azure-deployment.service';
import { NetworkDbPodsComponent } from './network-db/network-db-pods.component';
import { NetworkDbSitesComponent } from './network-db/network-db-sites.component';
import { NetworkDbVlansComponent } from './network-db/vlan-db/network-db-vlans.component';
import { NetworkDbVnisComponent } from './network-db/vlan-db/network-db-vnis.component';
import { NetworkDbUseCasesComponent } from './network-db/vlan-db/network-db-use-cases.component';
import { NetworkDbMulticastIpsComponent } from './network-db/vlan-db/network-db-multicast-ips.component';
import { NetworkDbNetworksComponent } from './network-db/vlan-db/network-db-networks.component';

@NgModule({
  declarations: [
    // Workflows
    LaunchPadSearchComponent,
    LaunchPadSearchElementsResultComponent,
    LaunchPadSearchServicesResultComponent,
    LaunchPadWorkflowsComponent,
    LaunchPadWorkflowLaunchComponent,
    // Azure Deployments
    AzureDeploymentActivitiesComponent,
    AzureDeploymentOverviewComponent,
    AzureDeploymentCreateComponent,
    AzureDeploymentsComponent,
    AzureDeploymentComponent,
    // Network DB
    NetworkDbSitesComponent,
    NetworkDbPodsComponent,
    NetworkDbVlansComponent,
    NetworkDbVnisComponent,
    NetworkDbUseCasesComponent,
    NetworkDbMulticastIpsComponent,
    NetworkDbNetworksComponent,
    // Shared
    ConfirmationDialogComponent
  ],
  exports: [
    AzureDeploymentActivitiesComponent,
    AzureDeploymentOverviewComponent,
    ConfirmationDialogComponent
  ],
  entryComponents: [
    ConfirmationDialogComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    LaunchPadWorkflowCoreModule,
    DynamicFormModule,
    RouterModule.forChild(launchPadRoutes)
  ],
  providers: [
    McsStorageService,
    LaunchPadGuard,
    DynamicFormModule,
    AzureDeploymentResolver,
    AzureDeploymentService
  ]
})

export class LaunchPadModule { }
