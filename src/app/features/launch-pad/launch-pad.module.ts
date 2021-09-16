import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McsStorageService } from '@app/core';
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
import { NetworkDbNetworkDetailsService } from './network-db/vlan-db/network/network-db-network.service';
import { NetworkDbNetworkDetailsResolver } from './network-db/vlan-db/network/network-db-network.resolver';
import { NetworkDbNetworkDetailsComponent } from './network-db/vlan-db/network/network-db-network.component';
import { NetworkDbNetworkCreateComponent } from './network-db/vlan-db/network-create/network-create.component';
import { NetworkDbNetworkOverviewComponent } from './network-db/vlan-db/network/overview/network-db-network-overview.component';
import { NetworkDbNetworkEventsComponent } from './network-db/vlan-db/network/events/network-db-network-events.component';
import { NetworkDbNetworkEditComponent } from './network-db/vlan-db/network/edit/network-edit.component';
import { NetworkDbNetworkVlansComponent } from './network-db/vlan-db/network/vlans/network-db-network-vlans.component';
import { CrispOrdersComponent } from './dashboard/orders/crisp-orders.component';
import { CrispOrderDetailsComponent } from './dashboard/orders/order/crisp-order-details.component';
import { CrispOrderElementsComponent } from './dashboard/orders/order/elements/crisp-order-elements.component';
import { CrispOrderService } from './dashboard/orders/order/crisp-order.service';
import { CrispOrderResolver } from './dashboard/orders/order/crisp-order.resolver';
import { DashboardProjectsComponent } from './dashboard/projects/dashboard-projects.component';
import { DashboardProjectDetailsComponent } from './dashboard/projects/project/dashboard-project-details.component';
import { DashboardProjectTasksComponent } from './dashboard/projects/project/tasks/dashboard-project-tasks.component';
import { DashboardProjectResolver } from './dashboard/projects/project/dashboard-project.resolver';
import { DashboardProjectService } from './dashboard/projects/project/dashboard-project.service';
import { FeaturesSharedModule } from '@app/features-shared';

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
    NetworkDbNetworkDetailsComponent,
    NetworkDbNetworkOverviewComponent,
    NetworkDbNetworkEventsComponent,
    NetworkDbNetworkCreateComponent,
    NetworkDbNetworkEditComponent,
    NetworkDbNetworkVlansComponent,
    // Dashboard
    DashboardProjectsComponent,
    DashboardProjectDetailsComponent,
    DashboardProjectTasksComponent,
    CrispOrdersComponent,
    CrispOrderDetailsComponent,
    CrispOrderElementsComponent,
    // Shared
    ConfirmationDialogComponent
  ],
  exports: [
    AzureDeploymentActivitiesComponent,
    AzureDeploymentOverviewComponent,
    CrispOrderElementsComponent,
    ConfirmationDialogComponent
  ],
  entryComponents: [
    ConfirmationDialogComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    LaunchPadWorkflowCoreModule,
    RouterModule.forChild(launchPadRoutes)
  ],
  providers: [
    McsStorageService,
    LaunchPadGuard,
    AzureDeploymentResolver,
    AzureDeploymentService,
    NetworkDbNetworkDetailsService,
    NetworkDbNetworkDetailsResolver,
    CrispOrderResolver,
    CrispOrderService,
    DashboardProjectResolver,
    DashboardProjectService,
  ]
})

export class LaunchPadModule { }
