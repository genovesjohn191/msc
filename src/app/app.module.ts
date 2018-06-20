import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import {
  NgModule,
  ErrorHandler
} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CookieModule } from 'ngx-cookie';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  CoreConfig,
  McsAuthenticationIdentity,
  McsRouteHandlerService,
  McsErrorHandlerService,
  McsNotificationJobService,
  McsNotificationContextService,
  GoogleAnalyticsEventsService,
  McsSessionHandlerService
} from './core';
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

/**
 * Application-Wide Providers
 */
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

/**
 * Set Core Configuration based on environment variables
 */
export function coreConfig(): CoreConfig {
  return {
    apiHost: resolveEnvVar('API_HOST', API_URL),
    loginUrl: resolveEnvVar('LOGIN_URL', LOGIN_URL),
    logoutUrl: resolveEnvVar('LOGOUT_URL', LOGOUT_URL),
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
    HttpClientModule,
    BrowserAnimationsModule,
    CookieModule.forRoot(),
    CoreModule.forRoot(coreConfig),
    SharedModule,
    ConsolePageModule,
    DefaultPageModule,
    PageNotificationsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    environment.ENV_PROVIDERS,
    APP_PROVIDERS,
    { provide: ErrorHandler, useFactory: errorHandlerProvider }
  ]
})

export class AppModule {
  private _destroySubject = new Subject<void>();

  constructor(
    private _authIdentity: McsAuthenticationIdentity,
    private _routeHandlerService: McsRouteHandlerService,
    private _errorHandlerService: McsErrorHandlerService,
    private _notificationJobService: McsNotificationJobService,
    private _notificationContextService: McsNotificationContextService,
    private _googleAnalyticsEventsService: GoogleAnalyticsEventsService,
    private _sessionHandlerService: McsSessionHandlerService
  ) {
    this._initializeDependentServices();
    this._listenToUserChanges();
    this._listenToSessionTimedOut();
  }

  /**
   * Listens to every user changed.
   *
   * `@Note`: In most cases, this will only called once
   */
  private _listenToUserChanges(): void {
    this._authIdentity.userChanged
      .pipe(takeUntil(this._destroySubject))
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        // We need to initialize all the required services after obtaining
        // the user identity because we want to make sure that the user
        // is authenticated, otherwise it will conflict to other process that
        // dependent on the user identity, like getting the job/connection prior to authentication.
        this._initializeRavenSentry();
        this._initializeAuthorizedServices();
      });
  }

  /**
   * Listens to sessioned timed out
   */
  private _listenToSessionTimedOut(): void {
    this._sessionHandlerService.onSessionTimedOut()
      .pipe(takeUntil(this._destroySubject))
      .subscribe((response) => {
        if (!response) { return; }
        this._releaseServices();
      });
  }

  /**
   * Initializes the raven sentry configuration
   */
  private _initializeRavenSentry(): void {
    setUserIdentity(
      this._authIdentity.user.userId,
      `${this._authIdentity.user.firstName} ${this._authIdentity.user.lastName}`,
      this._authIdentity.user.email
    );
  }

  /**
   * Initializes all dependent services, this doesn't require authentication to work on
   */
  private _initializeDependentServices(): void {
    this._errorHandlerService.initialize();
  }

  /**
   * Initializes all authorized services
   */
  private _initializeAuthorizedServices(): void {
    this._notificationJobService.initialize();
    this._notificationContextService.initialize();
    this._googleAnalyticsEventsService.initialize();
    this._routeHandlerService.initialize();
    this._sessionHandlerService.initialize();
  }

  /**
   * Destroy all services
   */
  private _releaseServices(): void {
    this._notificationJobService.destroy();
    this._notificationContextService.destroy();
    this._sessionHandlerService.destroy();
  }
}
