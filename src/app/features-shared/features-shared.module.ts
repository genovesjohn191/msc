import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { ServerManageBackupVmComponent } from './server-manage-backup-vm/server-manage-backup-vm';
import { ServerManageBackupComponent } from './server-manage-backup/server-manage-backup';
import { AddOnInviewComponent } from './addon-inview/addon-inview';
import { AddOnSqlServerComponent } from './addon-sql-server/addon-sql-server';
import { AddOnHidsComponent } from './addon-hids/addon-hids';
import { OrderApprovalComponent } from './order-approval/order-approval.component';
import { OrderItemLeadTimeComponent } from './order-item-lead-time/order-item-lead-time.component';
import { ServerCommandComponent } from './server-command/server-command.component';
import { ServerManageMediaComponent } from './server-manage-media/server-manage-media.component';
import { ServerManageNetworkComponent } from './server-manage-network/server-manage-network.component';
import { ServerManageScaleComponent } from './server-manage-scale/server-manage-scale.component';
import { ServerManageStorageComponent } from './server-manage-storage/server-manage-storage.component';
import { VdcManageStorageComponent } from './vdc-manage-storage/vdc-manage-storage.component';
import { VdcManageScaleComponent } from './vdc-manage-scale/vdc-manage-scale.component';
import { StepOrderDetailsComponent } from './step-order-details/step-order-details.component';
import { StepProvisioningComponent } from './step-provisioning/step-provisioning.component';
import { StepManualOrderCompletedComponent } from './step-manual-order-completed/step-manual-order-completed.component';
import { OrderAgreementComponent } from './order-agreement/mcs-order-agreement.component';
import { SystemMessageFormComponent } from './system-message-form/system-message-form.component';
import { RenameServerDialogComponent } from './server-dialogs/rename-server/rename-server.dialog';
import { HelpWidgetComponent } from './help-widget/help-widget.component';
import { SmacSharedFormComponent } from './smac-shared-form/smac-shared-form.component';
import { FormFieldsModule } from './form-fields/form-fields.module';
import { ContextualCatalogLinkComponent } from './contextual-catalog-link/mcs-contextual-catalog-link.component';
import { InternetManagePortPlanComponent } from './internet-manage-port-plan/internet-manage-port-plan.component';
import { ContextMenuLinkComponent } from './context-menu-link/context-menu-link.component';

@NgModule({
  declarations: [
    ServerManageBackupVmComponent,
    ServerManageBackupComponent,
    AddOnInviewComponent,
    AddOnSqlServerComponent,
    AddOnHidsComponent,
    ContextualCatalogLinkComponent,
    OrderApprovalComponent,
    OrderItemLeadTimeComponent,
    ServerCommandComponent,
    ServerManageMediaComponent,
    ServerManageNetworkComponent,
    ServerManageScaleComponent,
    ServerManageStorageComponent,
    StepOrderDetailsComponent,
    StepProvisioningComponent,
    StepManualOrderCompletedComponent,
    VdcManageStorageComponent,
    VdcManageScaleComponent,
    OrderAgreementComponent,
    SystemMessageFormComponent,
    RenameServerDialogComponent,
    HelpWidgetComponent,
    SmacSharedFormComponent,
    InternetManagePortPlanComponent,
    ContextMenuLinkComponent
  ],
  imports: [
    SharedModule,
    FormFieldsModule,
  ],
  exports: [
    ServerManageBackupVmComponent,
    ServerManageBackupComponent,
    AddOnInviewComponent,
    AddOnSqlServerComponent,
    AddOnHidsComponent,
    ContextualCatalogLinkComponent,
    OrderApprovalComponent,
    OrderItemLeadTimeComponent,
    ServerCommandComponent,
    ServerManageMediaComponent,
    ServerManageNetworkComponent,
    ServerManageScaleComponent,
    ServerManageStorageComponent,
    StepOrderDetailsComponent,
    StepProvisioningComponent,
    StepManualOrderCompletedComponent,
    VdcManageStorageComponent,
    VdcManageScaleComponent,
    OrderAgreementComponent,
    SystemMessageFormComponent,
    RenameServerDialogComponent,
    HelpWidgetComponent,
    SmacSharedFormComponent,
    InternetManagePortPlanComponent,
    ContextMenuLinkComponent,
    FormFieldsModule
  ],
  entryComponents: [
    RenameServerDialogComponent
  ],
  providers: [
  ]
})

export class FeaturesSharedModule { }
