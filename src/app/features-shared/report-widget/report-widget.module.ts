import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { ChangeRequestWidgetComponent } from './change-requests/change-requests-widget.component';
import { ContactUsWidgetComponent } from './contact-us/contact-us-widget.component';
import { ServicesOverviewWidgetComponent } from './services-overview/services-overview-widget.component';
import { CostRecommendationsWidgetComponent } from './cost-recommendations/cost-recommendations-widget.component';
import { AzureResourcesWidgetComponent } from './azure-resources/azure-resources-widget.component';
import { ResourceChangesWidgetComponent } from './resource-changes/resource-changes-widget.component';

@NgModule({
  imports: [ SharedModule ],
  declarations: [
    AzureResourcesWidgetComponent,
    ChangeRequestWidgetComponent,
    ContactUsWidgetComponent,
    CostRecommendationsWidgetComponent,
    ResourceChangesWidgetComponent,
    ServicesOverviewWidgetComponent
  ],
  exports: [
    AzureResourcesWidgetComponent,
    ChangeRequestWidgetComponent,
    ContactUsWidgetComponent,
    CostRecommendationsWidgetComponent,
    ResourceChangesWidgetComponent,
    ServicesOverviewWidgetComponent
  ]
})
export class ReportWidgetModule { }
