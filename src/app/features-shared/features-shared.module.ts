import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { AddOnAntiMalwareComponent } from './addon-anti-malware/addon-anti-malware';
import { AddOnInviewComponent } from './addon-inview/addon-inview';
import { AddOnSqlServerComponent } from './addon-sql-server/addon-sql-server';
import { OrderApprovalComponent } from './order-approval/order-approval.component';
import { ServerCommandComponent } from './server-command/server-command.component';
import { ServerManageMediaComponent } from './server-manage-media/server-manage-media.component';
import { ServerManageNetworkComponent } from './server-manage-network/server-manage-network.component';
import { ServerManageScaleComponent } from './server-manage-scale/server-manage-scale.component';
import { ServerManageStorageComponent } from './server-manage-storage/server-manage-storage.component';
import { VdcManageStorageComponent } from './vdc-manage-storage/vdc-manage-storage.component';
import { StepOrderDetailsComponent } from './step-order-details/step-order-details.component';
import { StepProvisioningComponent } from './step-provisioning/step-provisioning.component';
import { OrderAgreementComponent } from './order-agreement/mcs-order-agreement.component';
import { SystemMessageFormComponent } from './system-message-form/system-message-form.component';
import { RenameServerDialogComponent } from './server-dialogs/rename-server/rename-server.dialog';
import { HelpWidgetComponent } from './help-widget/help-widget.component';

@NgModule({
  declarations: [
    AddOnAntiMalwareComponent,
    AddOnInviewComponent,
    AddOnSqlServerComponent,
    OrderApprovalComponent,
    ServerCommandComponent,
    ServerManageMediaComponent,
    ServerManageNetworkComponent,
    ServerManageScaleComponent,
    ServerManageStorageComponent,
    StepOrderDetailsComponent,
    StepProvisioningComponent,
    VdcManageStorageComponent,
    OrderAgreementComponent,
    SystemMessageFormComponent,
    RenameServerDialogComponent,
    HelpWidgetComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    AddOnAntiMalwareComponent,
    AddOnInviewComponent,
    AddOnSqlServerComponent,
    OrderApprovalComponent,
    ServerCommandComponent,
    ServerManageMediaComponent,
    ServerManageNetworkComponent,
    ServerManageScaleComponent,
    ServerManageStorageComponent,
    StepOrderDetailsComponent,
    StepProvisioningComponent,
    VdcManageStorageComponent,
    OrderAgreementComponent,
    SystemMessageFormComponent,
    RenameServerDialogComponent,
    HelpWidgetComponent
  ],
  entryComponents: [
    RenameServerDialogComponent
  ]
})

export class FeaturesSharedModule { }
