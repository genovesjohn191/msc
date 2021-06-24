import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { LaunchPadGuard } from '../launch-pad/launch-pad.guard';

import { CrispOrdersComponent } from './orders/crisp-orders.component';

export const crispRoutes: Routes = [
  {
    path: 'orders',
    component: CrispOrdersComponent,
    data: { routeId: RouteKey.CrispOrders },
    canActivate: [ LaunchPadGuard ]
  }
];
