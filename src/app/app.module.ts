import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {
  NgModule,
  ApplicationRef
} from '@angular/core';
import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';
import {
  RouterModule,
  PreloadAllModules
} from '@angular/router';

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
import { SharedModule } from './shared';
import { FeaturesModule } from './features';
import {
  CoreModule,
  CoreConfig,
  CoreDefinition
} from './core';

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

const mcsCoreConfig = {
  apiHost: API_URL,
  imageRoot: 'assets/img',
  iconRoot: 'assets/icon',
  notification: {
    host: API_WEBSOCKET_HOST,
    routePrefix: API_WEBSOCKET_ROUTE_PREFIX,
    user: 'guest', // TODO: Secure the user name and password (Research the proper implementation)
    password: 'guest'
  }
} as CoreConfig;

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
    CoreModule.forRoot(mcsCoreConfig),
    SharedModule,
    FeaturesModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})

export class AppModule {

  constructor(
    public appRef: ApplicationRef,
    public appState: AppState
  ) {
    // TODO: Temporary Set UserId and AccountId
    appState.set(CoreDefinition.APPSTATE_USER_ID, 'F500120501');
    appState.set(CoreDefinition.APPSTATE_ACCOUNT_ID, 'accountid');
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
      setTimeout(restoreInputValues);
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
