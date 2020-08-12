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

@NgModule({
  imports: [ SharedModule ],
  declarations: [
    ReportWidgetDataStatusComponent,
    AzureResourcesWidgetComponent,
    AzureTicketsWidgetComponent,
    ChangeRequestWidgetComponent,
    ContactUsWidgetComponent,
    CostRecommendationsWidgetComponent,
    ResourceChangesWidgetComponent,
    ServicesOverviewWidgetComponent
  ],
  exports: [
    AzureResourcesWidgetComponent,
    AzureTicketsWidgetComponent,
    ChangeRequestWidgetComponent,
    ContactUsWidgetComponent,
    CostRecommendationsWidgetComponent,
    ResourceChangesWidgetComponent,
    ServicesOverviewWidgetComponent,
    ReportWidgetDataStatusComponent
  ]
})
export class ReportWidgetModule { }
