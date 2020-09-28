import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/** Modules */
import { SharedModule } from '@app/shared';
/** Multiple Components */
import { StateChangeNotificationsComponent } from './state-change-notifications';
import { NavigationComponent } from './main-navigation';
/** Layout Components */
import { MainLoaderComponent } from './main-loader/main-loader.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from './footer/footer.component';
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
    NavigationComponent
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
    NavigationComponent,
    CommonModule,
    FormsModule,
    SharedModule
  ],
  providers: [
    ...coreLayoutProviders
  ]
})

export class CoreLayoutModule { }
