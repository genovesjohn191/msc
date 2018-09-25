import { NgModule } from '@angular/core';
import { ResourcesModule } from './resources/resources.module';
import { ServersModule } from './servers/servers.module';
import { TicketsModule } from './tickets/tickets.module';
import { FirewallsModule } from './firewalls/firewalls.module';
import { ToolsModule } from './tools/tools.module';
import { ProductsModule } from './products/products.module';
import { MediaModule } from './media/media.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { HttpErrorPageModule } from './http-error-page/http-error-page.module';

@NgModule({
  imports: [
    DashboardModule,
    ResourcesModule,
    ServersModule,
    TicketsModule,
    FirewallsModule,
    ToolsModule,
    ProductsModule,
    MediaModule,
    NotificationsModule,
    OrdersModule,
    HttpErrorPageModule
  ]
})

export class FeaturesModule { }
