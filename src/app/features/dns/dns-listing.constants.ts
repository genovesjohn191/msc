import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';

import { DnsDetailsComponent } from './details/dns-details.component';
import { DnsDetailsResolver } from './details/dns-details.resolver';
import { DnsDetailsService } from './details/dns-details.service';
import { DnsManagementComponent } from './details/management/dns-management.component';
import { DnsZonesComponent } from './details/zones/dns-zones.component';
import { DnsListingComponent } from './dns-listing.component';

export const dnsProviders: any[] = [
  DnsDetailsService,
  DnsDetailsResolver
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
      dns: DnsDetailsResolver
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
