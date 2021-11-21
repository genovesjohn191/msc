import {
  NgModule,
  Type
} from '@angular/core';
import { SharedModule } from '@app/shared';

import { FeaturesSharedModule } from '../features-shared.module';
import { FormFieldsModule } from '../form-fields/form-fields.module';
import { AscAlertsWidgetComponent } from './asc-alerts/asc-alerts-widget.component';
import { AuditAlertsWidgetComponent } from './audit-alerts/audit-alerts-widget.component';
import { AzureResourcesWidgetComponent } from './azure-resources/azure-resources-widget.component';
import { AzureTicketsWidgetComponent } from './azure-tickets/azure-tickets-widget.component';
import { BackupSecurityWidgetComponent } from './backup-security/backup-security-widget.component';
import {
  BillingOperationService,
  BillingServiceWidgetComponent,
  BillingSummaryWidgetComponent
} from './billing';
import { ChangeRequestWidgetComponent } from './change-requests/change-requests-widget.component';
import { ComplianceWidgetComponent } from './compliance/compliance-widget.component';
import { ContactUsWidgetComponent } from './contact-us/contact-us-widget.component';
import { CostRecommendationsWidgetComponent } from './cost-recommendations/cost-recommendations-widget.component';
import { InefficientVmsWidgetComponent } from './inefficient-vms/inefficient-vms-widget.component';
import { MonitoringAndAlertingWidgetComponent } from './monitoring-and-alerting/monitoring-and-alerting-widget.component';
import { OperationalMonthlySavingsWidgetComponent } from './operational-monthly-savings/operational-monthly-savings-widget.component';
import { OperationalSavingsSubitemsViewerComponent } from './operational-monthly-savings/subitems/operational-savings-subitems-viewer.component';
import { PerformanceAndScalabilityWidgetComponent } from './performance-and-scalability/performance-and-scalability-widget.component';
import { PlatformSecurityAdvisoriesWidgetComponent } from './platform-security-advisories/platform-security-advisories-widget.component';
import { PrivateCloudServicesOverviewWidgetComponent } from './private-cloud-services-overview/private-cloud-services-overview-widget.component';
import { RecentServiceRequestSltWidgetComponent } from './recent-service-request-slt/recent-service-request-slt-widget.component';
import { ReportWidgetDataStatusComponent } from './report-widget-data-status.component';
import { ResourceChangesWidgetComponent } from './resource-changes/resource-changes-widget.component';
import { ResourceHealthWidgetComponent } from './resource-health/resource-health-widget.component';
import { ResourceMonthlyCostWidgetComponent } from './resource-monthly-cost/resource-monthly-cost-widget.component';
import { SecurityWidgetComponent } from './security/security-widget.component';
import { ServicesCostOverviewWidgetComponent } from './services-cost-overview/services-cost-overview-widget.component';
import { ServicesOverviewWidgetComponent } from './services-overview/services-overview-widget.component';
import { StorageProfileUtilisationWidgetComponent } from './storage-profile-utilisation/storage-profile-utilisation-widget.component';
import { TopVmsByCostWidgetComponent } from './top-vms-by-cost/top-vms-by-cost-widget.component';
import { UpdateManagementWidgetComponent } from './update-management/update-management-widget.component';
import { VirtualMachineUsageBreakdownWidgetComponent } from './virtual-machine-usage-breakdown/virtual-machine-usage-breakdown-widget.component';
import { VmRightsizingWidgetComponent } from './vm-rightsizing/vm-rightsizing-widget.component';

const exports: any[] | Type<any> = [
  AscAlertsWidgetComponent,
  AuditAlertsWidgetComponent,
  AzureResourcesWidgetComponent,
  AzureTicketsWidgetComponent,
  BackupSecurityWidgetComponent,
  BillingServiceWidgetComponent,
  BillingSummaryWidgetComponent,
  ChangeRequestWidgetComponent,
  ComplianceWidgetComponent,
  ContactUsWidgetComponent,
  CostRecommendationsWidgetComponent,
  InefficientVmsWidgetComponent,
  MonitoringAndAlertingWidgetComponent,
  OperationalMonthlySavingsWidgetComponent,
  OperationalSavingsSubitemsViewerComponent,
  PerformanceAndScalabilityWidgetComponent,
  PlatformSecurityAdvisoriesWidgetComponent,
  PrivateCloudServicesOverviewWidgetComponent,
  RecentServiceRequestSltWidgetComponent,
  ReportWidgetDataStatusComponent,
  ResourceChangesWidgetComponent,
  ResourceHealthWidgetComponent,
  ResourceMonthlyCostWidgetComponent,
  SecurityWidgetComponent,
  ServicesCostOverviewWidgetComponent,
  ServicesOverviewWidgetComponent,
  StorageProfileUtilisationWidgetComponent,
  TopVmsByCostWidgetComponent,
  UpdateManagementWidgetComponent,
  VirtualMachineUsageBreakdownWidgetComponent,
  VmRightsizingWidgetComponent
];

@NgModule({
  imports: [
    FormFieldsModule,
    FeaturesSharedModule,
    SharedModule
  ],
  declarations: [...exports],
  exports: [...exports],
  providers: [
    BillingOperationService
  ]
})
export class ReportWidgetModule { }
