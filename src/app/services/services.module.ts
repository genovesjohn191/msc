import {
  Injector,
  ModuleWithProviders,
  NgModule,
  Optional,
  Provider,
  SkipSelf
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

import {
  repositoryProviders,
  stateManagers
} from './services.contants';

@NgModule({
  providers: [
    ...stateManagers,
    ...repositoryProviders
  ]
})

export class ServicesModule {
  /**
   * Use this method in your root module to provide the ServicesModule
   * and it should only be derived once
   */
  public static forRoot(): ModuleWithProviders<ServicesModule> {
    return { ngModule: ServicesModule };
  }

  constructor(
    @Optional() @SkipSelf() parentModule: ServicesModule,
    private _injector: Injector
  ) {
    if (parentModule) {
      throw new Error('Service is already loaded. Import it in the AppModule only');
    }
    this._initializeInjectors();
  }

  /**
   * Initializes the state managers injectors
   */
  private _initializeInjectors(): void {
    if (isNullOrEmpty(stateManagers)) { return; }
    stateManagers.forEach((stateManager) => {
      this._injector.get<Provider>(stateManager as any);
    });
  }
}
