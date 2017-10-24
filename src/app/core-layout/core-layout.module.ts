import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
/** Modules */
import { SharedModule } from '../shared';
/** Multiple Components */
import {
  StateChangeNotificationsComponent,
  StateChangeNotificationComponent,
  StateChangeNotificationMaxDisplayPipe
} from './state-change-notifications';
import {
  MainNavigationComponent,
  NavigationDesktopComponent,
  NavigationMobileComponent,
  NavigationDesktopItemsDirective,
  NavigationMobileItemsDirective
} from './main-navigation';
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
import {
  AccountPanelComponent,
  SwitchAccountComponent,
  RecentCompaniesMaxPipe
} from './shared';
/** Constants */
import { coreLayoutProviders } from './core-layout.constants';

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    AccountPanelComponent,
    SwitchAccountComponent,
    RecentCompaniesMaxPipe,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    RunningNotificationComponent,
    UserPanelComponent,
    StateChangeNotificationComponent,
    StateChangeNotificationsComponent,
    MainNavigationComponent,
    NavigationDesktopComponent,
    NavigationMobileComponent,
    NavigationDesktopItemsDirective,
    NavigationMobileItemsDirective,
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
    AccountPanelComponent,
    SwitchAccountComponent,
    RecentCompaniesMaxPipe,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    RunningNotificationComponent,
    UserPanelComponent,
    StateChangeNotificationComponent,
    StateChangeNotificationsComponent,
    MainNavigationComponent,
    NavigationDesktopComponent,
    NavigationMobileComponent,
    NavigationDesktopItemsDirective,
    NavigationMobileItemsDirective,
    RunningNotificationMaxDisplayPipe,
    StateChangeNotificationMaxDisplayPipe,
    CommonModule,
    RouterModule,
    FormsModule
  ],
  providers: [
    ...coreLayoutProviders
  ]
})

export class CoreLayoutModule { }
