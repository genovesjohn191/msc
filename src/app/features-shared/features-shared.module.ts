import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { AddOnAntiMalwareComponent } from './addon-anti-malware/addon-anti-malware';
import { AddOnInviewComponent } from './addon-inview/addon-inview';
import { AddOnSqlServerComponent } from './addon-sql-server/addon-sql-server';
import { ServerManageMediaComponent } from './server-manage-media/server-manage-media.component';
import { ServerManageNetworkComponent } from './server-manage-network/server-manage-network.component';
import { ServerManageScaleComponent } from './server-manage-scale/server-manage-scale.component';
import { ServerManageStorageComponent } from './server-manage-storage/server-manage-storage.component';
import { StepOrderDetailsComponent } from './step-order-details/step-order-details.component';
import { StepProvisioningComponent } from './step-provisioning/step-provisioning.component';

@NgModule({
  declarations: [
    AddOnAntiMalwareComponent,
    AddOnInviewComponent,
    AddOnSqlServerComponent,
    ServerManageMediaComponent,
    ServerManageNetworkComponent,
    ServerManageScaleComponent,
    ServerManageStorageComponent,
    StepOrderDetailsComponent,
    StepProvisioningComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    AddOnAntiMalwareComponent,
    AddOnInviewComponent,
    AddOnSqlServerComponent,
    ServerManageMediaComponent,
    ServerManageNetworkComponent,
    ServerManageScaleComponent,
    ServerManageStorageComponent,
    StepOrderDetailsComponent,
    StepProvisioningComponent
  ]
})

export class FeaturesSharedModule { }
