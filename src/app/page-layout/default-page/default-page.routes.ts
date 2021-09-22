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
      {
        path: 'compute/virtual',
        data: { routeId: RouteKey.Servers },
        loadChildren: () => import('../../features/servers/servers.module').then(m => m.ServersModule)
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
        data: { routeId: RouteKey.DnsListing },
        loadChildren: () =>
          import('../../features/dns/dns-listing.module').then(m => m.DnsListingModule)
      },
      {
        path: 'storage/aggregation-targets',
        data: { routeId: RouteKey.BackupAggregationTargets },
        loadChildren: () => import('../../features/aggregation-targets/aggregation-targets.module').then(m => m.AggregationTargetsModule)
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
        path: 'licenses',
        data: { routeId: RouteKey.Licenses },
        loadChildren: () => import('../../features/licenses/licenses.module').then(m => m.LicensesModule)
      },
      {
        path: 'billing',
        data: { routeId: RouteKey.Billing },
        loadChildren: () => import('../../features/billing/billing.module').then(m => m.BillingModule)
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
