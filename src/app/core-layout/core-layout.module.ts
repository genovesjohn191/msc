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
  NavigationMobileComponent,
  NavigationComponent
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
import {
  HeaderComponent,
  UserPanelComponent,
  ContextSwitchComponent
} from './header';
import {
  AccountPanelComponent,
  NotificationPanelComponent,
  SwitchAccountComponent,
  RecentCompaniesMaxPipe
} from './shared';
/** Constants */
import { coreLayoutProviders } from './core-layout.constants';
import { SystemMessageBannerComponent } from './system-message-banner/system-message-banner.component';

@NgModule({
  declarations: [
    AccountPanelComponent,
    NotificationPanelComponent,
    SwitchAccountComponent,
    RecentCompaniesMaxPipe,
    MainLoaderComponent,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    UserPanelComponent,
    ContextSwitchComponent,
    StateChangeNotificationsComponent,
    MainNavigationComponent,
    NavigationComponent,
    NavigationDesktopComponent,
    NavigationMobileComponent,
    SubNavigationComponent,
    SubNavigationDesktopComponent,
    SubNavigationMobileComponent,
    SystemMessageBannerComponent
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
    ContextSwitchComponent,
    StateChangeNotificationsComponent,
    MainNavigationComponent,
    NavigationComponent,
    NavigationDesktopComponent,
    NavigationMobileComponent,
    SubNavigationComponent,
    SubNavigationDesktopComponent,
    SubNavigationMobileComponent,
    SystemMessageBannerComponent,
    CommonModule,
    FormsModule,
    SharedModule
  ],
  providers: [
    ...coreLayoutProviders
  ]
})

export class CoreLayoutModule { }
