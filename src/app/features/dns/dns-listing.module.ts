import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';

import {
  dnsProviders,
  dnsRoutes
} from './dns-listing.constants';
import { DnsListingComponent } from './dns-listing.component';
import { DnsZoneComponent } from './zones/dns-zone.component';
import { DnsZoneOverviewComponent } from './zones/overview/dns-zone-overview.component';
import { DnsZoneRecordComponent } from './zones/records/dns-zone-record.component';
import { DnsServiceComponent } from './service/dns-service.component';
import { DnsServiceOverviewComponent } from './service/overview/dns-service-overview.component';

@NgModule({
  declarations: [
    DnsListingComponent,
    DnsZoneComponent,
    DnsZoneOverviewComponent,
    DnsZoneRecordComponent,
    DnsServiceComponent,
    DnsServiceOverviewComponent
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
