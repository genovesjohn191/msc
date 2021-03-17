import { NgModule } from '@angular/core';
/** Components */
import { RouterModule } from '@angular/router';
import { CoreLayoutModule } from '@app/core-layout';

import { PageNotificationsModule } from '../page-notifications/page-notifications.module';
import { CatalogPageHeaderComponent } from './catalog-page-header/catalog-page-header.component';
import { CatalogPageComponent } from './catalog-page.component';
import { CatalogPageGuard } from './catalog-page.guard';
import { catalogPageRoutes } from './catalog-page.routes';

@NgModule({
  declarations: [
    CatalogPageComponent,
    CatalogPageHeaderComponent
  ],
  imports: [
    CoreLayoutModule,
    PageNotificationsModule,
    RouterModule.forChild(catalogPageRoutes)
  ],
  providers: [
    CatalogPageGuard
  ]
})

export class CatalogPageModule { }
