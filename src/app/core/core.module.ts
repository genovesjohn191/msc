import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
/** Configuration */
import { CoreConfig } from './core.config';
/** Services */
import { McsApiService } from './services/mcs-api.service';
import { McsAuthService } from './services/mcs-auth.service';
import { MscStorageService } from './services/mcs-storage.service';
import { McsBrowserService } from './services/mcs-browser.service';
import { McsNotificationJobService } from './services/mcs-notification-job.service';
import { McsNotificationContextService } from './services/mcs-notification-context.service';
import { BreadcrumbsService } from './breadcrumbs/breadcrumbs.service';
/** Providers */
import { EnvironmentProvider } from './providers/environment.provider';
import { TextContentProvider } from './providers/text-content.provider';
import { AssetsProvider } from './providers/assets.provider';
import { FilterProvider } from './providers/filter.provider';
/** Components */
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from './footer/footer.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { HeaderComponent } from './header/header.component';
import { UserPanelComponent } from './user-panel/user-panel.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule
  ],
  declarations: [
    MainNavigationComponent,
    BreadcrumbsComponent,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    UserPanelComponent
  ],
  exports: [
    CommonModule,
    MainNavigationComponent,
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    UserPanelComponent
  ],
  providers: [
    BreadcrumbsService,
    McsApiService,
    McsAuthService,
    MscStorageService,
    McsBrowserService,
    McsNotificationJobService,
    McsNotificationContextService,
    EnvironmentProvider,
    TextContentProvider,
    AssetsProvider,
    FilterProvider
  ]
})

export class CoreModule {
  public static forRoot(config: CoreConfig): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        { provide: CoreConfig, useValue: config }
      ]
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
