import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { DnsDetailsComponent } from './details/dns-details.component';
import { DnsResolver } from './details/dns.resolver';
import { DnsManagementComponent } from './details/management/dns-management.component';
import { DnsZonesComponent } from './details/zones/dns-zones.component';
import { DnsListingComponent } from './dns-listing.component';
import { DnsService } from './dns.service';

export const dnsProviders: any[] = [
  DnsService,
  DnsResolver
];


export const dnsRoutes: Routes = [
  {
    path: '',
    component: DnsListingComponent
  },
  {
    path: 'details/:id',
    component: DnsDetailsComponent,
    data: { routeId: RouteKey.DnsDetails },
    resolve: {
      dns: DnsResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'management',
        pathMatch: 'full',
        data: { routeId: RouteKey.DnsManagement }
      },
      {
        path: 'management',
        component: DnsManagementComponent,
        data: { routeId: RouteKey.DnsManagement }
      },
      {
        path: 'zones',
        component: DnsZonesComponent,
        data: { routeId: RouteKey.DnsZones }
      },
    ]
  },
];
