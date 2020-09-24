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
        loadChildren: '../../features/dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'launch-pad',
        data: { routeId: RouteKey.LaunchPad },
        loadChildren: '../../features/launch-pad/launch-pad.module#LaunchPadModule'
      },
      {
        path: 'compute/virtual',
        data: { routeId: RouteKey.Servers },
        loadChildren: '../../features/servers/servers.module#ServersModule'
      },
      {
        path: 'system/messages',
        data: { routeId: RouteKey.SystemMessages },
        loadChildren: '../../features/system/system.module#SystemModule'
      },
      {
        path: 'compute/media',
        data: { routeId: RouteKey.Media },
        loadChildren: '../../features/media/media.module#MediaModule'
      },
      {
        path: 'tickets',
        data: { routeId: RouteKey.Tickets },
        loadChildren: '../../features/tickets/tickets.module#TicketsModule'
      },
      {
        path: 'notifications',
        data: { routeId: RouteKey.Notifications },
        loadChildren: '../../features/notifications/notifications.module#NotificationsModule'
      },
      {
        path: 'network/firewalls',
        data: { routeId: RouteKey.Firewalls },
        loadChildren: '../../features/firewalls/firewalls.module#FirewallsModule'
      },
      {
        path: 'network/internet',
        data: { routeId: RouteKey.Internet },
        loadChildren: '../../features/internet/internet.module#InternetModule'
      },
      {
        path: 'storage/aggregation-targets',
        data: { routeId: RouteKey.BackupAggregationTargets },
        loadChildren: '../../features/aggregation-targets/aggregation-targets.module#AggregationTargetsModule'
      },
      {
        path: 'tools',
        data: { routeId: RouteKey.OtherTools },
        loadChildren: '../../features/tools/tools.module#ToolsModule'
      },
      {
        path: 'catalog',
        data: { routeId: RouteKey.Catalog },
        loadChildren: '../../features/catalog/catalog.module#CatalogModule'
      },
      {
        path: 'orders',
        data: { routeId: RouteKey.Orders },
        loadChildren: '../../features/orders/orders.module#OrdersModule'
      },
      {
        path: 'licenses',
        data: { routeId: RouteKey.Licenses },
        loadChildren: '../../features/licenses/licenses.module#LicensesModule'
      },
      // New routes must be added on top of this error route page
      {
        path: '**',
        data: { routeId: RouteKey.HttpErrorPage },
        loadChildren: '../../features/http-error-page/http-error-page.module#HttpErrorPageModule'
      }
    ]
  }
];
