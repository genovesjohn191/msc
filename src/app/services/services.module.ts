import {
  NgModule,
  Optional,
  SkipSelf,
  ModuleWithProviders
} from '@angular/core';
import { servicesProviders } from './services.contants';

@NgModule({
  providers: [
    ...servicesProviders
  ]
})

export class ServicesModule {
  /**
   * Use this method in your root module to provide the ServicesModule
   * and it should only be derived once
   */
  public static forRoot(): ModuleWithProviders {
    return { ngModule: ServicesModule };
  }

  constructor(@Optional() @SkipSelf() parentModule: ServicesModule) {
    if (parentModule) {
      throw new Error('Service is already loaded. Import it in the AppModule only');
    }
  }
}
