import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';
import { OrderResolver } from './order/order.resolver';
import { OrdersDashboardComponent } from './dashboard/orders-dashboard.component';
import { OrdersDashboardService } from './dashboard/orders-dashboard.service';
import { OrderGroupComponent } from './dashboard/group/order-group.component';

import { ServerManagedScaleComponent } from './server-managed-scale/server-managed-scale.component';
import { VdcScaleComponent } from './vdc-scale/vdc-scale.component';
import { VdcStorageExpandComponent } from './vdc-storage-expand/vdc-storage-expand.component';
import { VdcStorageCreateComponent } from './vdc-storage-create/vdc-storage-create.component';
import { ServiceInviewRaiseComponent } from './service-inview-raise/service-inview-raise.component';
import { ServiceCustomChangeComponent } from './service-custom-change/service-custom-change.component';
import { HostedDnsChangeComponent } from './hosted-dns-change/hosted-dns-change.component';
import { ColocationStaffEscortComponent } from './colocation-staff-escort/colocation-staff-escort.component';
import { ChangeToApplyComponent } from './hosted-dns-change/change-to-apply/change-to-apply.component';
import { AddAntiVirusComponent } from './add-anti-virus/add-anti-virus.component';
import { AddHidsComponent } from './add-hids/add-hids.component';
import { AddServerBackupComponent } from './add-server-backup/add-server-backup.component';
import { AddVmBackupComponent } from './add-vm-backup/add-vm-backup.component';
import { AddBatComponent } from './add-bat/add-bat.component';
import { MsLicenseCountChangeComponent } from './ms-license-count-change/ms-license-count-change.component';
import { MsRequestChangeComponent } from './ms-request-change/ms-request-change.component';
import { OrdersGuard } from './orders.guard';

/**
 * List of services for the main module
 */
export const ordersProviders: any[] = [
  OrdersGuard,
  OrderResolver,
  OrdersDashboardService
];

/**
 * List of all the entry components
 */
export const ordersComponents: any[] = [
  OrdersComponent,
  OrderComponent,
  OrdersDashboardComponent,
  OrderGroupComponent,
  ServerManagedScaleComponent,
  VdcScaleComponent,
  VdcStorageExpandComponent,
  VdcStorageCreateComponent,
  ServiceInviewRaiseComponent,
  ServiceCustomChangeComponent,
  HostedDnsChangeComponent,
  ColocationStaffEscortComponent,
  ChangeToApplyComponent,
  AddAntiVirusComponent,
  AddHidsComponent,
  AddServerBackupComponent,
  AddVmBackupComponent,
  AddBatComponent,
  MsLicenseCountChangeComponent,
  MsRequestChangeComponent
];

/**
 * List of routes for the main module
 */
export const ordersRoutes: Routes = [
  {
    path: '',
    component: OrdersComponent,
    canActivate: [ OrdersGuard ]
  },
  {
    path: 'history',
    component: OrdersComponent,
    data: { routeId: RouteKey.OrdersHistory }
  },
  {
    path: 'dashboard',
    component: OrdersDashboardComponent,
    data: { routeId: RouteKey.OrdersDashboard }
  },
  {
    path: 'server-managed-scale',
    component: ServerManagedScaleComponent,
    data: { routeId: RouteKey.OrderServerManagedScale }
  },
  {
    path: 'vdc-scale',
    component: VdcScaleComponent,
    data: { routeId: RouteKey.OrderVdcScale }
  },
  {
    path: 'vdc-storage-expand',
    component: VdcStorageExpandComponent,
    data: { routeId: RouteKey.OrderVdcStorageExpand }
  },
  {
    path: 'vdc-storage-create',
    component: VdcStorageCreateComponent,
    data: { routeId: RouteKey.OrderVdcStorageCreate }
  },
  {
    path: 'services/inview',
    component: ServiceInviewRaiseComponent,
    data: { routeId: RouteKey.OrderServiceInviewRaise }
  },
  {
    path: 'services/custom-change',
    component: ServiceCustomChangeComponent,
    data: { routeId: RouteKey.OrderServiceCustomChange }
  },
  {
    path: 'hosted-dns-change',
    component: HostedDnsChangeComponent,
    data: { routeId: RouteKey.OrderHostedDnsChange }
  },
  {
    path: 'colocation/staff-escort',
    component: ColocationStaffEscortComponent,
    data: { routeId: RouteKey.OrderColocationStaffEscort }
  },
  {
    path: 'add/anti-virus',
    component: AddAntiVirusComponent,
    data: { routeId: RouteKey.OrderAddAntiVirus }
  },
  {
    path: 'add/host-intrusion-detection',
    component: AddHidsComponent,
    data: { routeId: RouteKey.OrderAddHids }
  },
  {
    path: 'add/server-backup',
    component: AddServerBackupComponent,
    data: { routeId: RouteKey.OrderAddServerBackup }
  },
  {
    path: 'add/vm-backup',
    component: AddVmBackupComponent,
    data: { routeId: RouteKey.OrderAddVmBackup }
  },
  {
    path: 'add/backup-aggregation-target',
    component: AddBatComponent,
    data: { routeId: RouteKey.OrderAddBat }
  },
  {
    path: 'ms-license-count-change',
    component: MsLicenseCountChangeComponent,
    data: { routeId: RouteKey.OrderMsLicenseCountChange }
  },
  {
    path: 'ms-request-change',
    component: MsRequestChangeComponent,
    data: { routeId: RouteKey.OrderMsRequestChange }
  },
  // Add additional routes above this line
  {
    path: 'history/:id',
    component: OrderComponent,
    data: { routeId: RouteKey.OrderDetails },
    resolve: {
      order: OrderResolver
    }
  },
];
