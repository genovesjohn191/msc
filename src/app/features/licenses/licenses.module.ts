import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

import {
  licensesRoutes,
  licensesProviders,
  licensesComponents
} from './licenses.constants';

@NgModule({
  declarations: [
    ...licensesComponents
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(licensesRoutes)
  ],
  providers: [
    ...licensesProviders
  ]
})

export class LicensesModule { }
