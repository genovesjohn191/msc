import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import {
  NgModule,
  ApplicationRef,
  ErrorHandler
} from '@angular/core';
import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';
import { RouterModule } from '@angular/router';
import { CookieModule } from 'ngx-cookie';

/**
 * Raven logger
 */
import {
  errorHandlerProvider,
  setUserIdentity
} from './app.logger';

/**
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';

/**
 * App is our top level component
 */
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import {
  AppState,
  InternalStateType
} from './app.service';

/**
 * Styling SASS
 */
import '../styles/base.scss';

/**
 * Routing
 */
import { routes } from './app.routes';

/**
 * MCS Portal Modules Declaration
 */
import {
  CoreModule,
  CoreConfig,
  McsAuthenticationIdentity
} from './core';
import {
  ConsolePageModule,
  DefaultPageModule
} from './page-layout';
import { SharedModule } from './shared';

/**
 * MCS Portal Utilities
 */
import {
  refreshView,
  resolveEnvVar
} from './utilities';

/**
 * Application-Wide Providers
 */
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * Set Core Configuration based on environment variables
 */
export function coreConfig(): CoreConfig {
  return {
    apiHost: resolveEnvVar('API_HOST', API_URL),
    loginUrl: resolveEnvVar('LOGIN_URL', LOGIN_URL),
    logoutUrl: resolveEnvVar('LOGOUT_URL', LOGOUT_URL),
    imageRoot: resolveEnvVar('IMAGE_ROOT', IMAGE_URL),
    iconRoot: resolveEnvVar('ICON_ROOT', ICON_URL)
  } as CoreConfig;
}

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    CookieModule.forRoot(),
    CoreModule.forRoot(coreConfig),
    SharedModule,
    ConsolePageModule,
    DefaultPageModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS,
    { provide: ErrorHandler, useFactory: errorHandlerProvider }
  ]
})

export class AppModule {

  constructor(
    public appRef: ApplicationRef,
    public appState: AppState,
    public authIdentityService: McsAuthenticationIdentity
  ) {
    this.setRavenUserSettings();
  }

  /**
   * Set the user settings of RAVEN for each changes of the identity
   */
  public setRavenUserSettings(): void {
    this.authIdentityService.changeIdentityStream
      .subscribe((isChanged) => {
        if (isChanged) {
          setUserIdentity(
            this.authIdentityService.userId,
            `${this.authIdentityService.firstName} ${this.authIdentityService.lastName}`,
            this.authIdentityService.email
          );
        }
      });
  }

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    console.log('HMR store', JSON.stringify(store, null, 2));
    // Set state
    this.appState._state = store.state;
    // Set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      refreshView(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    // Save state
    const state = this.appState._state;
    store.state = state;
    // Recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // Save input values
    store.restoreInputValues = createInputTransfer();
    // Remove styles
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    // Display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
