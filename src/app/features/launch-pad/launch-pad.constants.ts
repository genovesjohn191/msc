import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '@app/core';
import { RouteKey } from '@app/models';

import { AzureDeploymentCreateComponent } from './azure-deployments/azure-deployment-create/azure-deployment-create.component';
import { AzureDeploymentComponent } from './azure-deployments/azure-deployment/azure-deployment.component';
import { AzureDeploymentResolver } from './azure-deployments/azure-deployment/azure-deployment.resolver';
import { AzureDeploymentActivitiesComponent } from './azure-deployments/azure-deployment/history/azure-deployment-history.component';
import { AzureDeploymentOverviewComponent } from './azure-deployments/azure-deployment/overview/azure-deployment-overview.component';
import { AzureDeploymentsComponent } from './azure-deployments/azure-deployments.component';
import { CrispOrdersComponent } from './dashboard/orders/crisp-orders.component';
import { CrispOrderDetailsComponent } from './dashboard/orders/order/crisp-order-details.component';
import { CrispOrderResolver } from './dashboard/orders/order/crisp-order.resolver';
import { CrispOrderElementsComponent } from './dashboard/orders/order/elements/crisp-order-elements.component';
import { DashboardProjectsComponent } from './dashboard/projects/dashboard-projects.component';
import { DashboardProjectDetailsComponent } from './dashboard/projects/project/dashboard-project-details.component';
import { DashboardProjectResolver } from './dashboard/projects/project/dashboard-project.resolver';
import { DashboardProjectTasksComponent } from './dashboard/projects/project/tasks/dashboard-project-tasks.component';
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
import { NetworkDbNetworkOverviewComponent } from './network-db/vlan-db/network/overview/network-db-network-overview.component';
import { NetworkDbNetworkVlansComponent } from './network-db/vlan-db/network/vlans/network-db-network-vlans.component';
import { NetworkDbVlansComponent } from './network-db/vlan-db/vlans/network-db-vlans.component';
import { NetworkVlanEventsComponent } from './network-db/vlan-db/vlans/vlan/events/vlan-events.component';
import { NetworkVlanComponent } from './network-db/vlan-db/vlans/vlan/network-vlan.component';
import { NetworkVlanResolver } from './network-db/vlan-db/vlans/vlan/network-vlan.resolver';
import { NetworkVlanOverviewComponent } from './network-db/vlan-db/vlans/vlan/overview/vlan-overview.component';
import { LaunchPadSearchComponent } from './search/launch-pad-search.component';
import { VCenterRemediateEsxiHostsComponent } from './vcenter-baselines/remediate-esxi-hosts/remediate-esxi-hosts.component';
import { VCenterBaselinesComponent } from './vcenter-baselines/vcenter-baselines.component';
import {
  companyIdParam,
  productIdParam,
  serviceIdParam,
  sourceParam,
  worklowGroupIdParam,
  LaunchPadWorkflowLaunchComponent
} from './workflows/workflow-launch.component';

/**
 * List of routes for the main module
 */
export const launchPadRoutes: Routes = [
  {
    path: 'search/:keyword',
    component: LaunchPadSearchComponent,
    data: { routeId: RouteKey.LaunchPadSearch },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: `workflows/launch/:${sourceParam}/:${companyIdParam}/:${worklowGroupIdParam}/:${serviceIdParam}/:${productIdParam}`,
    component: LaunchPadWorkflowLaunchComponent,
    data: { routeId: RouteKey.LaunchPadWorkflowLaunch },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'azure-deployments',
    component: AzureDeploymentsComponent,
    data: { routeId: RouteKey.LaunchPadAzureDeployments },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'azure-deployments/create',
    component: AzureDeploymentCreateComponent,
    data: { routeId: RouteKey.LaunchPadAzureDeploymentCreate },
    canActivate: [ LaunchPadGuard ],
    canDeactivate: [ McsNavigateAwayGuard ],
  },
  {
    path: 'azure-deployments/:id',
    component: AzureDeploymentComponent,
    data: { routeId: RouteKey.LaunchPadAzureDeploymentDetails },
    canActivate: [ LaunchPadGuard ],
    resolve: {
      deployment: AzureDeploymentResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.LaunchPadAzureDeploymentDetailsOverview }
      },
      {
        path: 'overview',
        component: AzureDeploymentOverviewComponent,
        data: { routeId: RouteKey.LaunchPadAzureDeploymentDetailsOverview }
      },
      {
        path: 'history',
        component: AzureDeploymentActivitiesComponent,
        data: { routeId: RouteKey.LaunchPadAzureDeploymentDetailsHistory }
      }
    ]
  },
  {
    path: 'network-db/sites',
    component: NetworkDbSitesComponent,
    data: { routeId: RouteKey.LaunchPadNetworkDbPods },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'network-db/pods',
    component: NetworkDbPodsComponent,
    data: { routeId: RouteKey.LaunchPadNetworkDbPods },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'network-db/vlan-db/vlans',
    component: NetworkDbVlansComponent,
    data: { routeId: RouteKey.LaunchPadNetworkDbVlans },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'network-db/vlan-db/vlans/:id',
    component: NetworkVlanComponent,
    data: { routeId: RouteKey.LaunchPadNetworkDbVlanDetails },
    canActivate: [ LaunchPadGuard ],
    resolve: { vlan: NetworkVlanResolver },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.LaunchPadNetworkDbVlanDetailsOverview }
      },
      {
        path: 'overview',
        component: NetworkVlanOverviewComponent,
        data: { routeId: RouteKey.LaunchPadNetworkDbVlanDetailsOverview }
      },
      {
        path: 'events',
        component: NetworkVlanEventsComponent,
        data: { routeId: RouteKey.LaunchPadNetworkDbVlanDetailsEvents }
      }
    ]
  },
  {
    path: 'network-db/vlan-db/vnis',
    component: NetworkDbVnisComponent,
    data: { routeId: RouteKey.LaunchPadNetworkDbVnis },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'network-db/vlan-db/use-cases',
    component: NetworkDbUseCasesComponent,
    data: { routeId: RouteKey.LaunchPadNetworkDbUseCases },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'network-db/vlan-db/multicast-ips',
    component: NetworkDbMulticastIpsComponent,
    data: { routeId: RouteKey.LaunchPadNetworkDbMulticastIps },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'network-db/vlan-db/networks',
    component: NetworkDbNetworksComponent,
    data: { routeId: RouteKey.LaunchPadNetworkDbNetworks },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'network-db/vlan-db/networks/create',
    component: NetworkDbNetworkCreateComponent,
    data: { routeId: RouteKey.LaunchPadNetworkDbNetworkCreate },
    canActivate: [ LaunchPadGuard ],
    canDeactivate: [ McsNavigateAwayGuard ],
  },
  {
    path: 'network-db/vlan-db/networks/:id',
    component: NetworkDbNetworkDetailsComponent,
    data: { routeId: RouteKey.LaunchPadNetworkDbNetworkDetails },
    canActivate: [ LaunchPadGuard ],
    resolve: {
      network: NetworkDbNetworkDetailsResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.LaunchPadNetworkDbNetworkDetailsOverview }
      },
      {
        path: 'overview',
        component: NetworkDbNetworkOverviewComponent,
        data: { routeId: RouteKey.LaunchPadNetworkDbNetworkDetailsOverview }
      },
      {
        path: 'events',
        component: NetworkDbNetworkEventsComponent,
        data: { routeId: RouteKey.LaunchPadNetworkDbNetworkDetailsEvents }
      },
      {
        path: 'edit',
        component: NetworkDbNetworkEditComponent,
        data: { routeId: RouteKey.LaunchPadNetworkDbNetworkDetailsEdit }
      },
      {
        path: 'vlans',
        component: NetworkDbNetworkVlansComponent,
        data: { routeId: RouteKey.LaunchPadNetworkDbNetworkDetailsVlans }
      }
    ]
  },
  {
    path: 'vcenter/baselines',
    component: VCenterBaselinesComponent,
    data: { routeId: RouteKey.LaunchPadVCenterBaselines },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'vcenter/baselines/remediate',
    component: VCenterRemediateEsxiHostsComponent,
    data: { routeId: RouteKey.LaunchPadVCenterRemediateEsxiHosts },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'dashboard/projects',
    component: DashboardProjectsComponent,
    data: { routeId: RouteKey.LaunchPadDashboardProjects },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'dashboard/projects/:id',
    component: DashboardProjectDetailsComponent,
    data: { routeId: RouteKey.LaunchPadDashboardProjectDetails },
    resolve: {
      dashboardProject: DashboardProjectResolver
    },
    canActivate: [ LaunchPadGuard ],
    children: [
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full',
        data: { routeId: RouteKey.LaunchPadDashboardProjectDetailsTasks }
      },
      {
        path: 'tasks',
        component: DashboardProjectTasksComponent,
        data: { routeId: RouteKey.LaunchPadDashboardProjectDetailsTasks }
      }
    ]
  },
  // Deprecated - redirect to new path
  {
    path: 'crisp/orders',
    redirectTo: 'dashboard/orders'
  },
  {
    path: 'dashboard/orders',
    component: CrispOrdersComponent,
    data: { routeId: RouteKey.LaunchPadCrispOrders },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'dashboard/orders/:id',
    component: CrispOrderDetailsComponent,
    data: { routeId: RouteKey.LaunchPadCrispOrderDetails },
    resolve: {
      crispOrder: CrispOrderResolver
    },
    canActivate: [ LaunchPadGuard ],
    children: [
      {
        path: '',
        redirectTo: 'elements',
        pathMatch: 'full',
        data: { routeId: RouteKey.LaunchPadCrispOrderDetailsElements }
      },
      {
        path: 'elements',
        component: CrispOrderElementsComponent,
        data: { routeId: RouteKey.LaunchPadCrispOrderDetailsElements }
      }
    ]
  }
];
