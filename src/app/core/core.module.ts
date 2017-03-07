import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
/** Services */
import { McsPortalApiService } from './services/mcs-portal-api.service';
import { McsPortalApiConfig } from './services/mcs-potal-api.config';
import { McsPortalAuthService } from './services/mcs-portal-auth.service';
/** Providers */
import { EnvironmentProvider } from './providers/environment.provider';
import { TextContentProvider } from './providers/text-content.provider';
/** Components */
import { MainNavigationComponent } from './main-navigation/main-navigation.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    MainNavigationComponent,
    ContentComponent,
    FooterComponent
  ],
  exports: [
    MainNavigationComponent,
    ContentComponent,
    FooterComponent,
    CommonModule
  ],
  providers: [
    McsPortalApiService,
    McsPortalAuthService,
    EnvironmentProvider,
    TextContentProvider
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
