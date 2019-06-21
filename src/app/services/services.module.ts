import {
  NgModule,
  Optional,
  SkipSelf,
  ModuleWithProviders,
  Injector
} from '@angular/core';
import {
  stateManagers,
  repositoryProviders
} from './services.contants';
import { isNullOrEmpty } from '@app/utilities';

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
  public static forRoot(): ModuleWithProviders {
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
      this._injector.get(stateManager);
    });
  }
}
