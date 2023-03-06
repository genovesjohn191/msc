import { Routes } from '@angular/router';
import { McsAuthenticationGuard } from '@app/core';
import { RouteKey } from '@app/models';

import { DefaultPageComponent } from './default-page.component';

export const defaultPageRoutes: Routes = [
  {
    path: '',
    component: DefaultPageComponent,
    canActivate: [McsAuthenticationGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
        data: { routeId: RouteKey.Dashboard }
      },
      {
        path: 'dashboard',
        data: { routeId: RouteKey.Dashboard },
        loadChildren: () => import('../../features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'launch-pad',
        data: { routeId: RouteKey.LaunchPad },
        loadChildren: () => import('../../features/launch-pad/launch-pad.module').then(m => m.LaunchPadModule)
      },
      // Deprecated - FUSION-8369: redirect the old path of servers
      {
        path: 'compute/virtual',
        redirectTo: 'compute/resources'
      },
      {
        path: 'compute/servers',
        data: { routeId: RouteKey.Servers },
        loadChildren: () => import('../../features/servers/servers.module').then(m => m.ServersModule)
      },
      {
        path: 'compute/resources',
        data: { routeId: RouteKey.Resources },
        loadChildren: () => import('../../features/resources/resources.module').then(m => m.ResourcesModule)
      },
      {
        path: 'system/messages',
        data: { routeId: RouteKey.SystemMessages },
        loadChildren: () => import('../../features/system/system.module').then(m => m.SystemModule)
      },
      {
        path: 'compute/media',
        data: { routeId: RouteKey.Media },
        loadChildren: () => import('../../features/media/media.module').then(m => m.MediaModule)
      },
      {
        path: 'tickets',
        data: { routeId: RouteKey.Tickets },
        loadChildren: () => import('../../features/tickets/tickets.module').then(m => m.TicketsModule)
      },
      {
        path: 'notifications',
        data: { routeId: RouteKey.Notifications },
        loadChildren: () => import('../../features/notifications/notifications.module').then(m => m.NotificationsModule)
      },
      {
        path: 'network/firewalls',
        data: { routeId: RouteKey.Firewalls },
        loadChildren: () => import('../../features/firewalls/firewalls.module').then(m => m.FirewallsModule)
      },
      {
        path: 'network/internet',
        data: { routeId: RouteKey.Internet },
        loadChildren: () => import('../../features/internet/internet.module').then(m => m.InternetModule)
      },
      {
        path: 'network/dns',
        data: { routeId: RouteKey.DnsZoneListing },
        loadChildren: () =>
          import('../../features/dns/dns-listing.module').then(m => m.DnsListingModule)
      },
      {
        path: 'planned-work',
        data: { routeId: RouteKey.PlannedWorkListing },
        loadChildren: () =>
          import('../../features/planned-work/planned-work.module').then(m => m.PlannedWorkListingModule)
      },
      {
        path: 'storage/aggregation-targets',
        data: { routeId: RouteKey.BackupAggregationTargets },
        loadChildren: () => import('../../features/aggregation-targets/aggregation-targets.module').then(m => m.AggregationTargetsModule)
      },
      {
        path: 'storage/saas-backups',
        data: { routeId: RouteKey.SaasBackups },
        loadChildren: () => import('../../features/saas-backups/saas-backups.module').then(m => m.SaasBackupsModule)
      },
      {
        path: 'tools',
        data: { routeId: RouteKey.OtherTools },
        loadChildren: () => import('../../features/tools/tools.module').then(m => m.ToolsModule)
      },
      {
        path: 'orders',
        data: { routeId: RouteKey.Orders },
        loadChildren: () => import('../../features/orders/orders.module').then(m => m.OrdersModule)
      },
      {
        path: 'azure/reservations',
        data: { routeId: RouteKey.AzureReservations },
        loadChildren: () => import('../../features/azure-reservations/azure-reservations.module').then(m => m.AzureReservationsModule)
      },
      {
        path: 'azure/resources',
        data: { routeId: RouteKey.AzureResources },
        loadChildren: () => import('../../features/azure-resources/azure-resources.module').then(m => m.AzureResourcesModule)
      },
      {
        path: 'azure/subscriptions',
        data: { routeId: RouteKey.AzureSubscriptions },
        loadChildren: () =>
          import('../../features/azure-subscriptions/azure-subscriptions.module').then(m => m.AzureSubscriptionsModule)
      },
      {
        path: 'management-services',
        data: { routeId: RouteKey.AzureManagementServices },
        loadChildren: () =>
          import('../../features/azure-management-services/azure-management-services.module').then(m => m.AzureManagementServicesModule)
      },
      // Deprecated - FUSION-5845: redirect the old path of azure subscriptions
      {
        path: 'azure/managed-services',
        redirectTo: 'azure/subscriptions'
      },
      {
        path: 'azure/software-subscriptions',
        data: { routeId: RouteKey.AzureSoftwareSubscriptions },
        loadChildren: () => import('../../features/azure-software-subscriptions/azure-software-subscriptions.module')
          .then(m => m.AzureSoftwareSubscriptionsModule)
      },
      {
        path: 'azure/non-standard-bundles',
        data: { routeId: RouteKey.AzureNonStandardBundles },
        loadChildren: () => import('../../features/azure-non-standard-bundles/azure-non-standard-bundles.module')
          .then(m => m.AzureNonStandardBundlesModule)
      },
      {
        path: 'licenses',
        data: { routeId: RouteKey.Licenses },
        loadChildren: () => import('../../features/licenses/licenses.module').then(m => m.LicensesModule)
      },
      {
        path: 'billing',
        data: { routeId: RouteKey.Billing },
        loadChildren: () => import('../../features/billing/billing.module').then(m => m.BillingModule)
      },
      {
        path: 'azure-virtual-desktop',
        data: { routeId: RouteKey.Avd },
        loadChildren: () => import('../../features/azure-virtual-desktop/azure-virtual-desktop.module')
          .then(m => m.AzureVirtualDesktopModule)
      },
      {
        path: 'private-cloud/dashboard',
        data: { routeId: RouteKey.PrivateCloudDashboard },
        loadChildren: () => import('../../features/private-cloud-dashboard/private-cloud-dashboard.module')
          .then(m => m.PrivateCloudDashboardModule)
      },
      {
        path: 'hybrid-cloud/extenders',
        data: { routeId: RouteKey.Extenders },
        loadChildren: () =>
          import('../../features/extenders/extenders.module').then(m => m.ExtendersModule)
      },
      {
        path: 'hybrid-cloud/application-recovery',
        data: { routeId: RouteKey.ApplicationRecovery },
        loadChildren: () =>
          import('../../features/application-recovery/application-recovery.module').then(m => m.ApplicationRecoveryModule)
      },
      // New routes must be added on top of this error route page
      {
        path: '**',
        data: { routeId: RouteKey.HttpErrorPage },
        loadChildren: () => import('../../features/http-error-page/http-error-page.module').then(m => m.HttpErrorPageModule)
      }
    ]
  }
];
