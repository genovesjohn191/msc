import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
/** Shared Modules */
import { SharedModule } from '../shared';
/** Services */
import { BreadcrumbsService } from './breadcrumbs/breadcrumbs.service';
/** Multiple Components */
import {
  StateChangeNotificationsComponent,
  StateChangeNotificationComponent,
  StateChangeNotificationMaxDisplayPipe
} from './state-change-notifications';
/** Layout Components */
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from './footer/footer.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import {
  HeaderComponent,
  UserPanelComponent,
  RunningNotificationComponent,
  RunningNotificationMaxDisplayPipe
} from './header';

@NgModule({
  declarations: [
    MainNavigationComponent,
    BreadcrumbsComponent,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    RunningNotificationComponent,
    UserPanelComponent,
    StateChangeNotificationComponent,
    StateChangeNotificationsComponent,
    RunningNotificationMaxDisplayPipe,
    StateChangeNotificationMaxDisplayPipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedModule
  ],
  exports: [
    MainNavigationComponent,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    RunningNotificationComponent,
    UserPanelComponent,
    StateChangeNotificationComponent,
    StateChangeNotificationsComponent,
    RunningNotificationMaxDisplayPipe,
    StateChangeNotificationMaxDisplayPipe,
    CommonModule,
    RouterModule,
    FormsModule
  ],
  providers: [
    BreadcrumbsService
  ]
})

export class CoreLayoutModule { }
