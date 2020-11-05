import { NgModule } from '@angular/core';
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
import { SecurityAndComplianceWidgetComponent } from './security-and-compliance/security-and-compliance-widget.component';

@NgModule({
  imports: [ SharedModule ],
  declarations: [
    AzureResourcesWidgetComponent,
    AzureTicketsWidgetComponent,
    ChangeRequestWidgetComponent,
    ContactUsWidgetComponent,
    CostRecommendationsWidgetComponent,
    PerformanceAndScalabilityWidgetComponent,
    ReportWidgetDataStatusComponent,
    ResourceChangesWidgetComponent,
    SecurityAndComplianceWidgetComponent,
    ServicesCostOverviewWidgetComponent,
    ServicesOverviewWidgetComponent,
    VirtualMachineUsageBreakdownWidgetComponent
  ],
  exports: [
    AzureResourcesWidgetComponent,
    AzureTicketsWidgetComponent,
    ChangeRequestWidgetComponent,
    ContactUsWidgetComponent,
    CostRecommendationsWidgetComponent,
    PerformanceAndScalabilityWidgetComponent,
    ReportWidgetDataStatusComponent,
    ResourceChangesWidgetComponent,
    SecurityAndComplianceWidgetComponent,
    ServicesCostOverviewWidgetComponent,
    ServicesOverviewWidgetComponent,
    VirtualMachineUsageBreakdownWidgetComponent
  ]
})
export class ReportWidgetModule { }
