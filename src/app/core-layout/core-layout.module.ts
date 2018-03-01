import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
/** Modules */
import { SharedModule } from '../shared';
/** Multiple Components */
import { StateChangeNotificationsComponent } from './state-change-notifications';
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
  UserPanelComponent
} from './header';
import {
  AccountPanelComponent,
  NotificationPanelComponent,
  NotificationPanelMaxPipe,
  SwitchAccountComponent,
  RecentCompaniesMaxPipe
} from './shared';
/** Constants */
import { coreLayoutProviders } from './core-layout.constants';

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    AccountPanelComponent,
    NotificationPanelMaxPipe,
    NotificationPanelComponent,
    SwitchAccountComponent,
    RecentCompaniesMaxPipe,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    UserPanelComponent,
    StateChangeNotificationsComponent,
    MainNavigationComponent,
    NavigationDesktopComponent,
    NavigationMobileComponent,
    NavigationDesktopItemsDirective,
    NavigationMobileItemsDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedModule
  ],
  exports: [
    AccountPanelComponent,
    NotificationPanelMaxPipe,
    NotificationPanelComponent,
    SwitchAccountComponent,
    RecentCompaniesMaxPipe,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    UserPanelComponent,
    StateChangeNotificationsComponent,
    MainNavigationComponent,
    NavigationDesktopComponent,
    NavigationMobileComponent,
    NavigationDesktopItemsDirective,
    NavigationMobileItemsDirective,
    CommonModule,
    RouterModule,
    FormsModule
  ],
  providers: [
    ...coreLayoutProviders
  ]
})

export class CoreLayoutModule { }
