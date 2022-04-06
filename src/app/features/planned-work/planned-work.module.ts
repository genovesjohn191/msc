import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';
import { PlannedWorkAffectedServicesComponent } from './details/affected-services/planned-work-affected-services.component';
import { PlannedWorkOverviewComponent } from './details/overview/planned-work-overview.component';
import { PlannedWorkDetailsComponent } from './details/planned-work-details.component';

import { PlannedWorkListingComponent } from './planned-work-listing.component';
import {
  plannedWorkProviders,
  plannedWorkRoutes
} from './planned-work.constants';

@NgModule({
  declarations: [
    PlannedWorkListingComponent,
    PlannedWorkDetailsComponent,
    PlannedWorkOverviewComponent,
    PlannedWorkAffectedServicesComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(plannedWorkRoutes)
  ],
  providers: [
    ...plannedWorkProviders
  ]
})

export class PlannedWorkListingModule { }