import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { McsApiClientConfig } from './mcs-api-client.config';
import { apiClientProviders } from './mcs-api-client.constants';

@NgModule({
  providers: [
    ...apiClientProviders
  ],
  imports: [
    HttpClientModule,
    CookieModule.forRoot()
  ],
  exports: [
    HttpClientModule
  ]
})

export class McsApiClientModule {

  public static forRoot(config: (...args: any[]) => McsApiClientConfig, injectors?: any[]): ModuleWithProviders {
    return {
      ngModule: McsApiClientModule,
      providers: [
        { provide: McsApiClientConfig, useFactory: config, deps: injectors }
      ]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: McsApiClientModule) {
    if (parentModule) {
      throw new Error(
        'McsApiClientModule is already loaded. Import it in the AppModule only');
    }
  }
}
