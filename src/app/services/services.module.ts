import {
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { servicesProviders } from './services.contants';

@NgModule({
  providers: [
    ...servicesProviders
  ]
})

export class ServicesModule {
  constructor(@Optional() @SkipSelf() parentModule: ServicesModule) {
    if (parentModule) {
      throw new Error('Service is already loaded. Import it in the AppModule only');
    }
  }
}
