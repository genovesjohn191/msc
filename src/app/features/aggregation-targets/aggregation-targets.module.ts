import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';
import {
  aggregationTargetsRoutes,
  aggregationTargetsProviders
} from './aggregation-targets.constants';
import { AggregationTargetsComponent } from './aggregation-targets.component';
import {
  AggregationTargetComponent,
  AggregationTargetManagementComponent
} from './aggregation-target';


@NgModule({
  declarations: [
    AggregationTargetsComponent,
    AggregationTargetComponent,
    AggregationTargetManagementComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(aggregationTargetsRoutes)
  ],
  providers: [
    ...aggregationTargetsProviders
  ]
})

export class AggregationTargetsModule { }
