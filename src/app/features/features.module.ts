import { NgModule } from '@angular/core';
import { ResourcesModule } from './resources/resources.module';
import { ServersModule } from './servers/servers.module';
import { TicketsModule } from './tickets/tickets.module';
import { NetworkingModule } from './networking/networking.module';
import { ToolsModule } from './tools/tools.module';
import { ProductsModule } from './products/products.module';
import { MediasModule } from './medias/medias.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { GadgetsModule } from './gadgets/gadgets.module';
import { HttpErrorPageModule } from './http-error-page/http-error-page.module';

/** Service */
import {
  JobsApiService,
  OptionsApiService
} from './services';

@NgModule({
  imports: [
    DashboardModule,
    ResourcesModule,
    ServersModule,
    TicketsModule,
    NetworkingModule,
    ToolsModule,
    ProductsModule,
    MediasModule,
    NotificationsModule,
    GadgetsModule,
    OrdersModule,
    HttpErrorPageModule
  ],
  providers: [
    JobsApiService,
    OptionsApiService
  ]
})

export class FeaturesModule { }
