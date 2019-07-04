import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { PageNotificationsModule } from '../page-notifications/page-notifications.module';

/** Components */
import { consolePageRoutes } from './console-page.constants';
import { ConsolePageComponent } from './console-page.component';

@NgModule({
  declarations: [
    ConsolePageComponent
  ],
  imports: [
    SharedModule,
    PageNotificationsModule,
    RouterModule.forChild(consolePageRoutes)
  ]
})

export class ConsolePageModule { }
