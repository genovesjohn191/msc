import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';

import { DnsListingComponent } from './dns-listing.component';
import { DnsServiceDetailsResolver } from './service/dns-service.resolver';
import { DnsZoneDetailsResolver } from './zones/dns-zone.resolver';
import { DnsServiceDetailsService } from './service/dns-service.service';
import { DnsZoneDetailsService } from './zones/dns-zone.service';
import { DnsZoneComponent } from './zones/dns-zone.component';
import { DnsZoneOverviewComponent } from './zones/overview/dns-zone-overview.component';
import { DnsZoneRecordComponent } from './zones/records/dns-zone-record.component';
import { DnsServiceComponent } from './service/dns-service.component';
import { DnsServiceOverviewComponent } from './service/overview/dns-service-overview.component';

export const dnsProviders: any[] = [
  DnsZoneDetailsService,
  DnsServiceDetailsService,
  DnsServiceDetailsResolver,
  DnsZoneDetailsResolver
];

export const dnsRoutes: Routes = [
  {
    path: '',
    component: DnsListingComponent
  },
  {
    path: 'zones/:id',
    component: DnsZoneComponent,
    data: { routeId: RouteKey.DnsZoneDetails },
    resolve: {
      dns: DnsZoneDetailsResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.DnsZoneOverview }
      },
      {
        path: 'overview',
        component: DnsZoneOverviewComponent,
        data: { routeId: RouteKey.DnsZoneOverview }
      },
      {
        path: 'records',
        component: DnsZoneRecordComponent,
        data: { routeId: RouteKey.DnsZoneRecords }
      },
    ]
  },
  {
    path: 'services/:id',
    component: DnsServiceComponent,
    data: { routeId: RouteKey.DnsServiceDetails },
    resolve: {
      dns: DnsServiceDetailsResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.DnsServiceOverview }
      },
      {
        path: 'overview',
        component: DnsServiceOverviewComponent,
        data: { routeId: RouteKey.DnsServiceOverview }
      }
    ]
  },
];
