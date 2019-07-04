import { NgModule } from '@angular/core';
import { CoreLayoutModule } from '@app/core-layout';
import { PageNotificationsModule } from '../page-notifications/page-notifications.module';

/** Components */
import { RouterModule } from '@angular/router';
import { defaultPageRoutes } from './default-page.routes';
import { DefaultPageComponent } from './default-page.component';

@NgModule({
  declarations: [
    DefaultPageComponent,
  ],
  imports: [
    CoreLayoutModule,
    PageNotificationsModule,
    RouterModule.forChild(defaultPageRoutes)
  ]
})

export class DefaultPageModule { }
