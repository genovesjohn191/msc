import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
/** Services */
import { McsPortalApiService } from './services/mcs-portal-api.service';
import { McsPortalApiConfig } from './services/mcs-potal-api.config';
import { McsPortalAuthService } from './services/mcs-portal-auth.service';
import { BreadcrumbsService } from './breadcrumbs/breadcrumbs.service';
/** Providers */
import { EnvironmentProvider } from './providers/environment.provider';
import { TextContentProvider } from './providers/text-content.provider';
import { AssetsProvider } from './providers/assets.provider';
/** Components */
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from './footer/footer.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { HeaderComponent } from './header/header.component';

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
    HeaderComponent
  ],
  exports: [
    CommonModule,
    MainNavigationComponent,
    ContentComponent,
    FooterComponent,
    HeaderComponent
  ],
  providers: [
    BreadcrumbsService,
    McsPortalApiService,
    McsPortalAuthService,
    EnvironmentProvider,
    TextContentProvider,
    AssetsProvider
  ]
})

export class CoreModule {
  public static forRoot(config: McsPortalApiConfig): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        { provide: McsPortalApiConfig, useValue: config }
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
