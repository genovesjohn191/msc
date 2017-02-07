import { ModuleWithProviders,
         NgModule,
         Optional,
         SkipSelf }                     from '@angular/core';
import { CommonModule }                 from '@angular/common';

import { FusionApiHttpClientService } from './services/fusion-api-http-client.service';

import { FusionApiConfig } from './services/fusion-api.config';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  exports: [
  ],
  providers: [
    FusionApiHttpClientService,
  ],
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
