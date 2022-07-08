import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McsStorageService } from '@app/core';
import { FeaturesSharedModule } from '@app/features-shared';
import {
  ConfirmationDialogComponent,
  SharedModule
} from '@app/shared';

import { AzureDeploymentCreateComponent } from './azure-deployments/azure-deployment-create/azure-deployment-create.component';
import { AzureDeploymentComponent } from './azure-deployments/azure-deployment/azure-deployment.component';
import { AzureDeploymentResolver } from './azure-deployments/azure-deployment/azure-deployment.resolver';
import { AzureDeploymentService } from './azure-deployments/azure-deployment/azure-deployment.service';
import { AzureDeploymentActivitiesComponent } from './azure-deployments/azure-deployment/history/azure-deployment-history.component';
import { AzureDeploymentOverviewComponent } from './azure-deployments/azure-deployment/overview/azure-deployment-overview.component';
import { AzureDeploymentsComponent } from './azure-deployments/azure-deployments.component';
import { CrispOrdersComponent } from './dashboard/orders/crisp-orders.component';
import { CrispOrderDetailsComponent } from './dashboard/orders/order/crisp-order-details.component';
import { CrispOrderResolver } from './dashboard/orders/order/crisp-order.resolver';
import { CrispOrderService } from './dashboard/orders/order/crisp-order.service';
import { CrispOrderElementsComponent } from './dashboard/orders/order/elements/crisp-order-elements.component';
import { DashboardProjectsComponent } from './dashboard/projects/dashboard-projects.component';
import { DashboardProjectDetailsComponent } from './dashboard/projects/project/dashboard-project-details.component';
import { DashboardProjectResolver } from './dashboard/projects/project/dashboard-project.resolver';
import { DashboardProjectService } from './dashboard/projects/project/dashboard-project.service';
import { DashboardProjectTasksComponent } from './dashboard/projects/project/tasks/dashboard-project-tasks.component';
/** Components */
import { launchPadRoutes } from './launch-pad.constants';
import { LaunchPadGuard } from './launch-pad.guard';
import { NetworkDbPodsComponent } from './network-db/network-db-pods.component';
import { NetworkDbSitesComponent } from './network-db/network-db-sites.component';
import { NetworkDbNetworkCreateComponent } from './network-db/vlan-db/network-create/network-create.component';
import { NetworkDbMulticastIpsComponent } from './network-db/vlan-db/network-db-multicast-ips.component';
import { NetworkDbNetworksComponent } from './network-db/vlan-db/network-db-networks.component';
import { NetworkDbUseCasesComponent } from './network-db/vlan-db/network-db-use-cases.component';
import { NetworkDbVnisComponent } from './network-db/vlan-db/network-db-vnis.component';
import { NetworkDbNetworkEditComponent } from './network-db/vlan-db/network/edit/network-edit.component';
import { NetworkDbNetworkEventsComponent } from './network-db/vlan-db/network/events/network-db-network-events.component';
import { NetworkDbNetworkDetailsComponent } from './network-db/vlan-db/network/network-db-network.component';
import { NetworkDbNetworkDetailsResolver } from './network-db/vlan-db/network/network-db-network.resolver';
import { NetworkDbNetworkDetailsService } from './network-db/vlan-db/network/network-db-network.service';
import { NetworkDbNetworkOverviewComponent } from './network-db/vlan-db/network/overview/network-db-network-overview.component';
import { NetworkDbNetworkVlansComponent } from './network-db/vlan-db/network/vlans/network-db-network-vlans.component';
import { NetworkDbVlansComponent } from './network-db/vlan-db/vlans/network-db-vlans.component';
import { NetworkVlanEventsComponent } from './network-db/vlan-db/vlans/vlan/events/vlan-events.component';
import { NetworkVlanComponent } from './network-db/vlan-db/vlans/vlan/network-vlan.component';
import { NetworkVlanResolver } from './network-db/vlan-db/vlans/vlan/network-vlan.resolver';
import { NetworkVlanOverviewComponent } from './network-db/vlan-db/vlans/vlan/overview/vlan-overview.component';
import { LaunchPadSearchComponent } from './search/launch-pad-search.component';
import { LaunchPadSearchElementsResultComponent } from './search/results-table/elements-result.component';
import { LaunchPadSearchServicesResultComponent } from './search/results-table/services-result.component';
import { LaunchPadWorkflowLaunchComponent } from './workflows/workflow-launch.component';
import { LaunchPadWorkflowCoreModule } from './workflows/workflow/workflow-core.module';

@NgModule({
  declarations: [
    // Workflows
    LaunchPadSearchComponent,
    LaunchPadSearchElementsResultComponent,
    LaunchPadSearchServicesResultComponent,
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
    NetworkVlanComponent,
    NetworkVlanOverviewComponent,
    NetworkVlanEventsComponent,
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
    NetworkVlanResolver
  ]
})

export class LaunchPadModule { }
