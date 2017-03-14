import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {
  NgModule,
  ApplicationRef
} from '@angular/core';
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
 * Bootstrap 4.0 Modules/Loader
 */
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

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
 * Core Modules and Configuration
 */
import {
  CoreModule,
  CoreConfig
} from './core';

/**
 * Routing
 */
import { routes } from './app.routes';

/**
 * MCS Portal Modules Declaration
 */
import {
  HomeModule,
  AboutModule,
  ServersModule,
  NetworkingModule,
  CatalogModule,
  DashboardModule
} from './features';

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

// TODO: Must come from ENV variables from server host
const mcsCoreConfig = {
  apiHost: 'http://localhost:11338/api',
  imageRoot: 'assets/img/'
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
    NgbModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpModule,
    CoreModule.forRoot(mcsCoreConfig),
    RouterModule.forRoot(routes),
    HomeModule,
    AboutModule,
    ServersModule,
    NetworkingModule,
    CatalogModule,
    DashboardModule
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
  ) { }

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
