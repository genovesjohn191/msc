import {
  NgModule,
  Type
} from '@angular/core';
import { SharedModule } from '@app/shared';
import { ChangeRequestWidgetComponent } from './change-requests/change-requests-widget.component';
import { ContactUsWidgetComponent } from './contact-us/contact-us-widget.component';
import { ServicesOverviewWidgetComponent } from './services-overview/services-overview-widget.component';
import { CostRecommendationsWidgetComponent } from './cost-recommendations/cost-recommendations-widget.component';
import { AzureResourcesWidgetComponent } from './azure-resources/azure-resources-widget.component';
import { ResourceChangesWidgetComponent } from './resource-changes/resource-changes-widget.component';
import { ReportWidgetDataStatusComponent } from './report-widget-data-status.component';
import { AzureTicketsWidgetComponent } from './azure-tickets/azure-tickets-widget.component';
import { ServicesCostOverviewWidgetComponent } from './services-cost-overview/services-cost-overview-widget.component';
import { VirtualMachineUsageBreakdownWidgetComponent } from './virtual-machine-usage-breakdown/virtual-machine-usage-breakdown-widget.component';
import { PerformanceAndScalabilityWidgetComponent } from './performance-and-scalability/performance-and-scalability-widget.component';
import { SecurityWidgetComponent } from './security/security-widget.component';
import { ResourceMonthlyCostWidgetComponent } from './resource-monthly-cost/resource-monthly-cost-widget.component';
import { OperationalMonthlySavingsWidgetComponent } from './operational-monthly-savings/operational-monthly-savings-widget.component';
import { VmRightsizingWidgetComponent } from './vm-rightsizing/vm-rightsizing-widget.component';
import { OperationalSavingsSubitemsViewerComponent } from './operational-monthly-savings/subitems/operational-savings-subitems-viewer.component';
import { ResourceHealthWidgetComponent } from './resource-health/resource-health-widget.component';
import { MonitoringAndAlertingWidgetComponent } from './monitoring-and-alerting/monitoring-and-alerting-widget.component';
import { ComplianceWidgetComponent } from './compliance/compliance-widget.component';

const exports: any[] | Type<any> = [
  AzureResourcesWidgetComponent,
  AzureTicketsWidgetComponent,
  ChangeRequestWidgetComponent,
  ComplianceWidgetComponent,
  ContactUsWidgetComponent,
  CostRecommendationsWidgetComponent,
  MonitoringAndAlertingWidgetComponent,
  OperationalMonthlySavingsWidgetComponent,
  OperationalSavingsSubitemsViewerComponent,
  PerformanceAndScalabilityWidgetComponent,
  ReportWidgetDataStatusComponent,
  ResourceChangesWidgetComponent,
  ResourceHealthWidgetComponent,
  ResourceMonthlyCostWidgetComponent,
  SecurityWidgetComponent,
  ServicesCostOverviewWidgetComponent,
  ServicesOverviewWidgetComponent,
  VirtualMachineUsageBreakdownWidgetComponent,
  VmRightsizingWidgetComponent
];

@NgModule({
  imports: [ SharedModule ],
  declarations: [...exports],
  exports: [...exports]
})
export class ReportWidgetModule { }
