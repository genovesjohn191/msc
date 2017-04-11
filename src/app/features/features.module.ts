import { NgModule } from '@angular/core';
import { ServersModule } from './servers/servers.module';
import { NetworkingModule } from './networking/networking.module';
import { CatalogModule } from './catalog/catalog.module';
import { DashboardModule } from './dashboard/dashboard.module';

@NgModule({
  imports: [
    DashboardModule,
    ServersModule,
    NetworkingModule,
    CatalogModule
  ]
})

export class FeaturesModule {
}
