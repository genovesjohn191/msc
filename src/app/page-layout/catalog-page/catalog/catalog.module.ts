import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

import {
  catalogRoutes,
  catalogProviders,
  catalogComponents
} from './catalog.constants';

@NgModule({
  declarations: [
    ...catalogComponents
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(catalogRoutes)
  ],
  providers: [
    ...catalogProviders
  ]
})

export class CatalogModule { }
