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
import { RemoteHandsComponent } from './remote-hands/remote-hands.component';
import { ServerRequestPatchComponent } from './server-request-patch/server-request-patch.component';
import { AddSimpleFirewallChangeComponent } from './simple-firewall-changes/add-firewall-changes/add-simple-firewall-change.component';
import { FirewallChangesSharedRuleComponent } from './simple-firewall-changes/firewall-changes-shared/rule/firewall-changes-shared-rule.component';
import { ModifySimpleFirewallChangeComponent } from './simple-firewall-changes/modify-firewall-changes/modify-simple-firewall-change.component';
import { RemoveSimpleFirewallChangeComponent } from './simple-firewall-changes/remove-firewall-changes/remove-simple-firewall-change.component';
import { ComplexFirewallChangeComponent } from './complex-firewall-change/complex-firewall-change.component';
import { OrdersGuard } from './orders.guard';
import { McsPrivateCloudOnlyGuard } from '@app/core/guards/mcs-private-cloud-only.guard';
import { McsPublicCloudOnlyGuard } from '@app/core/guards/mcs-public-cloud-only.guard';
import { ChangeInternetPortPlanComponent } from './change-internet-port-plan/change-internet-port-plan.component';
import { CloudHealthServicesComponent } from './ms-request-change/cloudhealth/cloudhealth-services.component';
import { ColocationDeviceRestartComponent } from './colocation-device-restart/colocation-device-restart.component';
import { ProvisionComponent } from './ms-request-change/provision/provision.component';
import { BackupRestoreRequestComponent } from './backup-restore-request/backup-restore-request.component';
import {
  AzureProfessionalServiceRequestComponent
} from './azure-professional-service-request/azure-professional-service-request.component';
import {
  PrivateChangeExtenderSpeedComponent
} from './change-extender-speed/private-change-extender-speed/private-change-extender-speed.component';
import {
  AzureExtendSpeedComponent
} from './change-extender-speed/azure-extend-speed/azure-extend-speed.component';
import { ChangeExtenderSpeedComponent } from './change-extender-speed/shared/change-extender-speed.component';
import { LicenseService } from '../licenses/licenses.service';
import { ChangeApplicationRecoveryQuotaComponent } from './change-application-recovery-quota/change-application-recovery-quota.component';

/**
 * List of services for the main module
 */
export const ordersProviders: any[] = [
  OrdersGuard,
  OrderResolver,
  OrdersDashboardService,
  LicenseService
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
  ColocationDeviceRestartComponent,
  ChangeToApplyComponent,
  AddAntiVirusComponent,
  AddHidsComponent,
  AddServerBackupComponent,
  AddVmBackupComponent,
  AddBatComponent,
  MsLicenseCountChangeComponent,
  MsRequestChangeComponent,
  RemoteHandsComponent,
  ServerRequestPatchComponent,
  AddSimpleFirewallChangeComponent,
  ModifySimpleFirewallChangeComponent,
  RemoveSimpleFirewallChangeComponent,
  FirewallChangesSharedRuleComponent,
  ComplexFirewallChangeComponent,  
  ChangeInternetPortPlanComponent,
  CloudHealthServicesComponent,
  ProvisionComponent,
  AzureProfessionalServiceRequestComponent,
  BackupRestoreRequestComponent,
  PrivateChangeExtenderSpeedComponent,
  ChangeExtenderSpeedComponent,
  AzureExtendSpeedComponent,
  ChangeApplicationRecoveryQuotaComponent
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
    path: 'change/server-managed-scale',
    component: ServerManagedScaleComponent,
    data: { routeId: RouteKey.OrderServerManagedScale },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },

  {
    path: 'change/vdc-scale',
    component: VdcScaleComponent,
    data: { routeId: RouteKey.OrderVdcScale },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },

  {
    path: 'change/vdc-storage',
    component: VdcStorageExpandComponent,
    data: { routeId: RouteKey.OrderVdcStorageExpand },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },

  {
    path: 'add/vdc-storage',
    component: VdcStorageCreateComponent,
    data: { routeId: RouteKey.OrderVdcStorageCreate },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },

  {
    path: 'change/services/inview',
    component: ServiceInviewRaiseComponent,
    data: { routeId: RouteKey.OrderServiceInviewRaise },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },

  {
    path: 'change/services/custom',
    component: ServiceCustomChangeComponent,
    data: { routeId: RouteKey.OrderServiceCustomChange },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },

  {
    path: 'change/hosted-dns',
    component: HostedDnsChangeComponent,
    data: { routeId: RouteKey.OrderHostedDnsChange },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },

  {
    path: 'change/colocation/staff-escort',
    component: ColocationStaffEscortComponent,
    data: { routeId: RouteKey.OrderColocationStaffEscort },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },

  {
    path: 'change/colocation/device-restart',
    component: ColocationDeviceRestartComponent,
    data: { routeId: RouteKey.OrderColocationDeviceRestart },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'add/anti-virus',
    component: AddAntiVirusComponent,
    data: { routeId: RouteKey.OrderAddAntiVirus },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'add/host-intrusion-detection',
    component: AddHidsComponent,
    data: { routeId: RouteKey.OrderAddHids },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'add/server-backup',
    component: AddServerBackupComponent,
    data: { routeId: RouteKey.OrderAddServerBackup },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'add/vm-backup',
    component: AddVmBackupComponent,
    data: { routeId: RouteKey.OrderAddVmBackup },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'add/backup-aggregation-target',
    component: AddBatComponent,
    data: { routeId: RouteKey.OrderAddBat },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'change/ms-license-count',
    component: MsLicenseCountChangeComponent,
    data: { routeId: RouteKey.OrderMsLicenseCountChange },
    canActivate: [ McsPublicCloudOnlyGuard ]
  },

  {
    path: 'change/ms-request',
    component: MsRequestChangeComponent,
    data: { routeId: RouteKey.OrderMsRequestChange },
    canActivate: [ McsPublicCloudOnlyGuard ]
  },

  {
    path: 'change/remote-hands',
    component: RemoteHandsComponent,
    data: { routeId: RouteKey.OrderRemoteHands },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },

  {
    path: 'change/request-patch',
    component: ServerRequestPatchComponent,
    data: { routeId: RouteKey.OrderServerRequestPatch },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'change/internet-port-plan',
    component: ChangeInternetPortPlanComponent,
    data: { routeId: RouteKey.OrderChangeInternetPortPlan },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'change/private-cloud-launch-extender-speed',
    component: PrivateChangeExtenderSpeedComponent,
    data: { routeId: RouteKey.OrderPrivateCloudChangeLaunchExtenderSpeed },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'change/azure-extend-speed',
    component: AzureExtendSpeedComponent,
    data: { routeId: RouteKey.OrderChangeAzureExtendSpeed },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'change/add-simple-firewall',
    component: AddSimpleFirewallChangeComponent,
    data: { routeId: RouteKey.OrderAddSimpleFirewallChange },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'change/modify-simple-firewall',
    component: ModifySimpleFirewallChangeComponent,
    data: { routeId: RouteKey.OrderModifySimpleFirewallChange },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'change/remove-simple-firewall',
    component: RemoveSimpleFirewallChangeComponent,
    data: { routeId: RouteKey.OrderRemoveSimpleFirewallChange },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'change/complex-firewall-change',
    component: ComplexFirewallChangeComponent,
    data: { routeId: RouteKey.OrderComplexFirewallChange },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'change/azure-professional-service-request',
    component: AzureProfessionalServiceRequestComponent,
    data: { routeId: RouteKey.OrderAzureProfessionalServiceRequest },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'change/restore-backup-request',
    component: BackupRestoreRequestComponent,
    data: { routeId: RouteKey.OrderRestoreBackupRequest },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  },
  {
    path: 'change/application-recovery-quota',
    component: ChangeApplicationRecoveryQuotaComponent,
    data: { routeId: RouteKey.OrderChangeApplicationRecoveryQuota },
    canActivate: [ McsPrivateCloudOnlyGuard ]
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
