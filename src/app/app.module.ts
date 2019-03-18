import { BrowserModule } from '@angular/platform-browser';
import {
  NgModule,
  ErrorHandler
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import {
  TranslateModule,
  TranslateLoader,
  TranslateService
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

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
import { environment } from 'environments/environment';

/**
 * App is our top level component
 */
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState } from './app.service';

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
  CoreConfig
} from './core';
import {
  EventBusModule,
  EventBusDispatcherService,
  EventBusState
} from './event-bus';
import { ServicesModule } from './services';
import {
  ConsolePageModule,
  DefaultPageModule
} from './page-layout';
import { PageNotificationsModule } from './page-notifications';
import { SharedModule } from './shared';

/**
 * MCS Portal Utilities
 */
import {
  resolveEnvVar,
  isNullOrEmpty
} from './utilities';
import { McsIdentity } from './models';

/**
 * Application-Wide Providers
 */
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/**
 * Set Core Configuration based on environment variables
 */
export function coreConfig(): CoreConfig {
  return {
    apiHost: resolveEnvVar('API_HOST', API_URL),
    macviewUrl: resolveEnvVar('MACVIEW_URL', MACVIEW_URL),
    loginUrl: resolveEnvVar('LOGIN_URL', LOGIN_URL),
    logoutUrl: resolveEnvVar('LOGOUT_URL', LOGOUT_URL),
    macviewOrdersUrl: resolveEnvVar('MACVIEW_ORDERS_URL', MACVIEW_ORDERS_URL),
    macviewChangePasswordUrl: resolveEnvVar('MACVIEW_CHANGE_PASSWORD_URL',
      MACVIEW_CHANGE_PASSWORD_URL),
    imageRoot: resolveEnvVar('IMAGE_ROOT', IMAGE_URL),
    iconRoot: resolveEnvVar('ICON_ROOT', ICON_URL),
    enryptionKey: resolveEnvVar('EK', EK)
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
    BrowserAnimationsModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),

    CoreModule.forRoot(coreConfig),
    EventBusModule.forRoot(),
    ServicesModule.forRoot(),

    SharedModule,
    ConsolePageModule,
    DefaultPageModule,
    PageNotificationsModule,
  ],
  providers: [
    environment.ENV_PROVIDERS,
    APP_PROVIDERS,
    {
      provide: ErrorHandler,
      useFactory: errorHandlerProvider
    }
  ]
})

export class AppModule {

  constructor(
    private _router: Router,
    private _translateService: TranslateService,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    this._initializeLanguage();
    this._initializeRoutes();
    this._registerEvents();
  }

  /**
   * Register event handlers for app module only
   */
  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      EventBusState.UserChange, this._onUserChanged.bind(this));
  }

  /**
   * Event that emits when user has been changed
   * @param user User emitted
   */
  private _onUserChanged(user: McsIdentity): void {
    if (isNullOrEmpty(user)) { return; }
    this._initializeRavenSentry(user);
  }

  /**
   * Initializes the raven sentry configuration
   */
  private _initializeRavenSentry(user: McsIdentity): void {
    setUserIdentity(
      user.userId,
      `${user.firstName} ${user.lastName}`,
      user.email
    );
  }

  /**
   * Initializes all the routes on the application
   *
   * `@Note`: This is needed in order for the
   * dynamic routing work in AOT as expected
   */
  private _initializeRoutes(): void {
    this._router.resetConfig(routes);
  }

  /**
   * Sets the default language to english
   */
  private _initializeLanguage() {
    this._translateService.setDefaultLang('en');
    this._translateService.use('en');
  }
}
