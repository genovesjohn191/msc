import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';

import { AddOnHidsComponent } from './addon-hids/addon-hids';
import { AddOnInviewComponent } from './addon-inview/addon-inview';
import { AddOnSqlServerComponent } from './addon-sql-server/addon-sql-server';
import { ContextMenuLinkComponent } from './context-menu-link/context-menu-link.component';
import { ContextualCatalogLinkComponent } from './contextual-catalog-link/mcs-contextual-catalog-link.component';
import { DnsZoneManageComponent } from './dns-zone-manage/dns-zone-manage.component';
import { DynamicFormModule } from './dynamic-form/dynamic-form.module';
import { EnquiryFormComponent } from './enquiry-form/enquiry-form.component';
import { FormFieldsModule } from './form-fields/form-fields.module';
import { HelpWidgetComponent } from './help-widget/help-widget.component';
import { InternetManagePortPlanComponent } from './internet-manage-port-plan/internet-manage-port-plan.component';
import { OrderAgreementComponent } from './order-agreement/mcs-order-agreement.component';
import { OrderApprovalComponent } from './order-approval/order-approval.component';
import { OrderItemLeadTimeComponent } from './order-item-lead-time/order-item-lead-time.component';
import { ServerCommandComponent } from './server-command/server-command.component';
import { RenameServerDialogComponent } from './server-dialogs/rename-server/rename-server.dialog';
/** Components */
import { ServerManageBackupVmComponent } from './server-manage-backup-vm/server-manage-backup-vm';
import { ServerManageBackupComponent } from './server-manage-backup/server-manage-backup';
import { ServerManageMediaComponent } from './server-manage-media/server-manage-media.component';
import { ServerManageNetworkComponent } from './server-manage-network/server-manage-network.component';
import { ServerManageScaleComponent } from './server-manage-scale/server-manage-scale.component';
import { ServerManageStorageComponent } from './server-manage-storage/server-manage-storage.component';
import { SmacSharedFormComponent } from './smac-shared-form/smac-shared-form.component';
import { StepManualOrderCompletedComponent } from './step-manual-order-completed/step-manual-order-completed.component';
import { StepOrderDetailsComponent } from './step-order-details/step-order-details.component';
import { StepProvisioningComponent } from './step-provisioning/step-provisioning.component';
import { SystemMessageFormComponent } from './system-message-form/system-message-form.component';
import {
  TerraformDeploymentRenameDialogComponent
} from './terraform-deployment-rename-dialog/terraform-deployment-rename-dialog.component';
import { TerraformTagChangeDialogComponent } from './terraform-tag-change-dialog/terraform-tag-change-dialog.component';
import { VdcManageScaleComponent } from './vdc-manage-scale/vdc-manage-scale.component';
import { VdcManageStorageComponent } from './vdc-manage-storage/vdc-manage-storage.component';
import { DnsZoneTtlEditDialogComponent } from './dns-zone-dialogs/dns-zone-ttl-edit-dialog.component';
import { OrderFirewallPolicyEditDialogComponent } from './order-dialogs/order-firewall-policy-dialog.component';

const exportedComponents = [
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
  TerraformTagChangeDialogComponent,
  TerraformDeploymentRenameDialogComponent,
  HelpWidgetComponent,
  SmacSharedFormComponent,
  InternetManagePortPlanComponent,
  ContextMenuLinkComponent,
  DnsZoneManageComponent,
  DnsZoneTtlEditDialogComponent,
  OrderFirewallPolicyEditDialogComponent,

  EnquiryFormComponent
];

@NgModule({
  declarations: exportedComponents,
  imports: [
    SharedModule,
    FormFieldsModule,
    DynamicFormModule
  ],
  exports: [
    ...exportedComponents,
    FormFieldsModule,
    DynamicFormModule
  ],
  providers: [
  ]
})

export class FeaturesSharedModule { }