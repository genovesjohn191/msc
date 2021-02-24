import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

import { dnsProviders, dnsRoutes } from './dns-listing.constants';
import { DnsListingComponent } from './dns-listing.component';
import { DnsDetailsComponent } from './details/dns-details.component';
import { DnsManagementComponent } from './details/management/dns-management.component';
@NgModule({
  declarations: [
    DnsListingComponent,
    DnsDetailsComponent,
    DnsManagementComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(dnsRoutes)
  ],
  providers: [
    ...dnsProviders
  ]
})

export class DnsListingModule { }
