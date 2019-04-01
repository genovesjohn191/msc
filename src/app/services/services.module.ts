import {
  NgModule,
  Optional,
  SkipSelf,
  ModuleWithProviders,
  Injector
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  initializableProviders,
  apiProviders,
  repositoryProviders,
  guardProviders
} from './services.contants';
import { IMcsInitializable } from '@app/core';

@NgModule({
  providers: [
    ...initializableProviders,
    ...apiProviders,
    ...repositoryProviders,
    ...guardProviders
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
    this._initializeRequiredProviders();
  }

  /**
   * Initializes required providers
   */
  private _initializeRequiredProviders(): void {
    if (isNullOrEmpty(initializableProviders)) { return; }

    initializableProviders.forEach((provider) => {
      let registeredProvider: IMcsInitializable = this._injector.get(provider);
      if (isNullOrEmpty(registeredProvider)) { return; }
      registeredProvider.initialize();
    });
  }
}
