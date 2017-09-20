import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
/** Modules */
import { SharedModule } from '../shared';
import { MainNavigationModule } from './main-navigation/main-navigation.module';
/** Multiple Components */
import {
  StateChangeNotificationsComponent,
  StateChangeNotificationComponent,
  StateChangeNotificationMaxDisplayPipe
} from './state-change-notifications';
/** Layout Components */
import { ContentComponent } from './content/content.component';
import { FooterComponent } from './footer/footer.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import {
  HeaderComponent,
  UserPanelComponent,
  RunningNotificationComponent,
  RunningNotificationMaxDisplayPipe
} from './header';
/** Constants */
import { coreLayoutProviders } from './core-layout.constants';

@NgModule({
  declarations: [
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
    SharedModule,
    MainNavigationModule
  ],
  exports: [
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
    FormsModule,
    MainNavigationModule
  ],
  providers: [
    ...coreLayoutProviders
  ]
})

export class CoreLayoutModule { }
