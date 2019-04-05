import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/** Modules */
import { SharedModule } from '@app/shared';
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
import { MainLoaderComponent } from './main-loader/main-loader.component';
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
    MainLoaderComponent,
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
    MainLoaderComponent,
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
    FormsModule,
    SharedModule
  ],
  providers: [
    ...coreLayoutProviders
  ]
})

export class CoreLayoutModule { }
