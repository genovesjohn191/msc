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
        redirectTo: '',
        pathMatch: 'full',
        data: { routeId: RouteKey.Dashboard }
      },
      {
        path: '',
        data: { routeId: RouteKey.Dashboard },
        loadChildren: '../../features/dashboard/dashboard.module#DashboardModule'
      },
      {
        path: '',
        data: { routeId: RouteKey.Servers },
        loadChildren: '../../features/servers/servers.module#ServersModule'
      },
      {
        path: '',
        data: { routeId: RouteKey.Media },
        loadChildren: '../../features/media/media.module#MediaModule'
      },
      {
        path: '',
        data: { routeId: RouteKey.Tickets },
        loadChildren: '../../features/tickets/tickets.module#TicketsModule'
      },
      {
        path: '',
        data: { routeId: RouteKey.Notifications },
        loadChildren: '../../features/notifications/notifications.module#NotificationsModule'
      },
      {
        path: '',
        data: { routeId: RouteKey.Firewalls },
        loadChildren: '../../features/firewalls/firewalls.module#FirewallsModule'
      },
      {
        path: '',
        data: { routeId: RouteKey.Internet },
        loadChildren: '../../features/internet/internet.module#InternetModule'
      },
      {
        path: '',
        data: { routeId: RouteKey.OtherTools },
        loadChildren: '../../features/tools/tools.module#ToolsModule'
      },
      {
        path: '',
        data: { routeId: RouteKey.ProductDetails },
        loadChildren: '../../features/products/products.module#ProductsModule'
      },
      {
        path: '',
        data: { routeId: RouteKey.Orders },
        loadChildren: '../../features/orders/orders.module#OrdersModule'
      },

      // New routes must be added on top of this error route page
      {
        path: '',
        data: { routeId: RouteKey.HttpErrorPage },
        loadChildren: '../../features/http-error-page/http-error-page.module#HttpErrorPageModule'
      }
    ]
  }
];
