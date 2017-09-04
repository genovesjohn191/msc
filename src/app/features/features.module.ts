import { NgModule } from '@angular/core';
import { ServersModule } from './servers/servers.module';
import { NetworkingModule } from './networking/networking.module';
import { CatalogModule } from './catalog/catalog.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GadgetsModule } from './gadgets/gadgets.module';
import { PageNotFoundModule } from './page-not-found/page-not-found.module';
import {
  AccessDeniedPageModule
} from './access-denied-page/access-denied-page.module';

@NgModule({
  imports: [
    DashboardModule,
    ServersModule,
    NetworkingModule,
    CatalogModule,
    NotificationsModule,
    GadgetsModule,
    PageNotFoundModule,
    AccessDeniedPageModule
  ]
})

export class FeaturesModule { }
