import { ModuleWithProviders,
         NgModule,
         Optional,
         SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FusionApiHttpClientService } from './services/fusion-api-http-client.service';

import { FusionApiConfig } from './services/fusion-api.config';

// Components Declarations
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
    FooterComponent
  ],
  providers: [
    FusionApiHttpClientService,
  ]
})

export class CoreModule {
  public static forRoot(config: FusionApiConfig): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        { provide: FusionApiConfig, useValue: config }
      ]
    };
  }

  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
