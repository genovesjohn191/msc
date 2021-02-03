import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

import { dnsRoutes } from './dns-listing.constants';
import { DnsListingComponent } from './dns-listing.component';

@NgModule({
  declarations: [
    DnsListingComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(dnsRoutes)
  ],
  providers: [
  ]
})

export class DnsListingModule { }
