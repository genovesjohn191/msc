import { NgModule } from '@angular/core';
import { ServersModule } from './servers/servers.module';
import { TicketsModule } from './tickets/tickets.module';
import { NetworkingModule } from './networking/networking.module';
import { ToolsModule } from './tools/tools.module';
import { ProductsModule } from './products/products.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GadgetsModule } from './gadgets/gadgets.module';
import { HttpErrorPageModule } from './http-error-page/http-error-page.module';
import { AccessDeniedPageModule } from './access-denied-page/access-denied-page.module';

/** Service */
import {
  JobsApiService,
  OptionsApiService
} from './services';

@NgModule({
  imports: [
    DashboardModule,
    ServersModule,
    TicketsModule,
    NetworkingModule,
    ToolsModule,
    ProductsModule,
    NotificationsModule,
    GadgetsModule,
    HttpErrorPageModule,
    AccessDeniedPageModule
  ],
  providers: [
    JobsApiService,
    OptionsApiService
  ]
})

export class FeaturesModule { }
