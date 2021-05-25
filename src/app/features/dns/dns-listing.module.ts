import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';

import { DnsDetailsComponent } from './details/dns-details.component';
import { DnsManagementComponent } from './details/management/dns-management.component';
import { DnsZonesComponent } from './details/zones/dns-zones.component';
import { DnsListingComponent } from './dns-listing.component';
import {
  dnsProviders,
  dnsRoutes
} from './dns-listing.constants';

@NgModule({
  declarations: [
    DnsListingComponent,
    DnsDetailsComponent,
    DnsManagementComponent,
    DnsZonesComponent
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
