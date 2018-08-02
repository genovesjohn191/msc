import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/** Modules */
import { SharedModule } from '../shared';
/** Multiple Components */
import { StateChangeNotificationsComponent } from './state-change-notifications';
import {
  MainNavigationComponent,
  NavigationDesktopComponent,
  NavigationMobileComponent
} from './main-navigation';
import {
  SubNavigationComponent,
  SubNavigationDesktopComponent,
  SubNavigationMobileComponent
} from './sub-navigation';
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
  SwitchAccountComponent,
  RecentCompaniesMaxPipe
} from './shared';
/** Constants */
import { coreLayoutProviders } from './core-layout.constants';

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    AccountPanelComponent,
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
    SubNavigationComponent,
    SubNavigationDesktopComponent,
    SubNavigationMobileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  exports: [
    AccountPanelComponent,
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
    SubNavigationComponent,
    SubNavigationDesktopComponent,
    SubNavigationMobileComponent,
    CommonModule,
    FormsModule
  ],
  providers: [
    ...coreLayoutProviders
  ]
})

export class CoreLayoutModule { }
