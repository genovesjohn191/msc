import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
/** Configuration */
import { CoreConfig } from './core.config';
/** Services/Providers */
import { coreProviders } from './core.constants';

@NgModule({
  providers: [
    ...coreProviders
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

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
