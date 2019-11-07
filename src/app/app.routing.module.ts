import { NgModule } from '@angular/core';
import {
  Router,
  Route,
  RouterModule
} from '@angular/router';

import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import { CoreRoutes } from '@app/core';
import { appRoutes } from '@app/app.routes';

import { consolePageRoutes } from '@app/page-layout/console-page/console-page.constants';
import { defaultPageRoutes } from '@app/page-layout/default-page/default-page.routes';
import { maintenacePageRoutes } from '@app/page-layout/maintenance-page/maintenance-page.constants';
import { systemMessagePageRoutes } from '@app/page-layout/system-message-page/system-message-page.constants';

import { dashboardRoutes } from '@app/features/dashboard/dashboard.constants';
import { firewallRoutes } from '@app/features/firewalls/firewalls.constants';
import { httpErrorPageRoutes } from '@app/features/http-error-page/http-error-page.constants';
import { internetRoutes } from '@app/features/internet/internet.constants';
import { mediaRoutes } from '@app/features/media/media.constants';
import { notificationsRoutes } from '@app/features/notifications/notifications.constants';
import { ordersRoutes } from '@app/features/orders/orders.constants';
import { productsRoutes } from '@app/features/products/products.constants';
import { resourcesRoutes } from '@app/features/resources/resources.constants';
import { serversRoutes } from '@app/features/servers/servers.constants';
import { systemRoutes } from '@app/features/system/system.constants';
import { ticketsRoutes } from '@app/features/tickets/tickets.constants';
import { toolsRoutes } from '@app/features/tools/tools.constants';

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule {

  constructor(private _router: Router) {
    this.initializeRouters();
  }

  public initializeRouters(): void {
    this._constructMainRoutes();
    this._constructLayoutRoutes();
    this._constructFeatureRoutes();
  }

  private _constructMainRoutes(): void {
    this._updateChildrenRoutePath(appRoutes);
  }

  private _constructLayoutRoutes(): void {
    this._updateChildrenRoutePath(consolePageRoutes);
    this._updateChildrenRoutePath(defaultPageRoutes);
    this._updateChildrenRoutePath(maintenacePageRoutes);
    this._updateChildrenRoutePath(systemMessagePageRoutes);
  }

  private _constructFeatureRoutes(): void {
    this._updateChildrenRoutePath(dashboardRoutes);
    this._updateChildrenRoutePath(firewallRoutes);
    this._updateChildrenRoutePath(httpErrorPageRoutes);
    this._updateChildrenRoutePath(internetRoutes);
    this._updateChildrenRoutePath(mediaRoutes);
    this._updateChildrenRoutePath(notificationsRoutes);
    this._updateChildrenRoutePath(ordersRoutes);
    this._updateChildrenRoutePath(productsRoutes);
    this._updateChildrenRoutePath(resourcesRoutes);
    this._updateChildrenRoutePath(systemRoutes);
    this._updateChildrenRoutePath(serversRoutes);
    this._updateChildrenRoutePath(ticketsRoutes);
    this._updateChildrenRoutePath(toolsRoutes);
  }

  private _updateChildrenRoutePath(children: Route[]): void {
    if (isNullOrEmpty(children)) { return; }

    children.forEach((child) => {
      this._updateChildrenRoutePath(child.children);
      this._updateRoutePath(child);
    });

    // We need to reset the configuration of the main routes because
    // it was declared initially, unlike the lazy loaded module routes
    this._router.resetConfig(appRoutes);
  }

  private _updateRoutePath(route: Route): void {
    if (isNullOrEmpty(route)) { return; }

    let routeId = getSafeProperty(route, (obj) => obj.data.routeId);
    if (!isNullOrEmpty(routeId)) {
      let dynamicPath = CoreRoutes.getRoutePath(routeId);

      isNullOrEmpty(route.pathMatch) ?
        route.path = dynamicPath :
        route.redirectTo = dynamicPath;
    }
  }
}
