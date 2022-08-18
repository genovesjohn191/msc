import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeaturesSharedModule } from '@app/features-shared';
/** Modules */
import { SharedModule } from '@app/shared';

import { ContentComponent } from './content/content.component';
/** Constants */
import { coreLayoutProviders } from './core-layout.constants';
import { FooterComponent } from './footer/footer.component';
import {
  HeaderComponent,
  UserPanelComponent
} from './header';
/** Layout Components */
import { MainLoaderComponent } from './main-loader/main-loader.component';
import { NavigationComponent } from './main-navigation';
import {
  AccountPanelComponent,
  ConsoleSheetComponent,
  FeedbackSheetComponent,
  NoticePanelComponent,
  ActivityPanelComponent,
  RecentCompaniesMaxPipe,
  SwitchAccountComponent
} from './shared';
/** Multiple Components */
import { StateChangeNotificationsComponent } from './state-change-notifications';

@NgModule({
  declarations: [
    AccountPanelComponent,
    ActivityPanelComponent,
    NoticePanelComponent,
    SwitchAccountComponent,
    RecentCompaniesMaxPipe,
    FeedbackSheetComponent,
    ConsoleSheetComponent,
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
    SharedModule,
    FeaturesSharedModule
  ],
  exports: [
    AccountPanelComponent,
    ActivityPanelComponent,
    SwitchAccountComponent,
    RecentCompaniesMaxPipe,
    FeedbackSheetComponent,
    ConsoleSheetComponent,
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
