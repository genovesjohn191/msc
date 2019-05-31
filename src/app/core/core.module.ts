import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
  ErrorHandler,
  Injector
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HttpClientModule,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  McsDisposable,
  isNullOrEmpty
} from '@app/utilities';
import { McsEvent } from '@app/event-manager';
import { CoreConfig } from './core.config';
import {
  coreProviders,
  initializableProviders
} from './core.constants';
import {
  McsSnackBarContainerComponent
} from './factory/snack-bar/mcs-snack-bar-container.component';
import { McsSnackBarRefDirective } from './factory/snack-bar/mcs-snack-bar-ref.directive';
import { GoogleAnalyticsEventsService } from './services/google-analytics-events.service';
import { McsSessionHandlerService } from './services/mcs-session-handler.service';
import { McsRouteHandlerService } from './services/mcs-route-handler.service';
import { McsNotificationJobService } from './services/mcs-notification-job.service';
import { McsNotificationContextService } from './services/mcs-notification-context.service';
import { McsErrorHandlerService } from './services/mcs-error-handler.service';
import { McsNotificationEventsService } from './services/mcs-notification-events.service';
import { McsRouteSettingsService } from './services/mcs-route-settings.service';
import { McsHttpClientInterceptor } from './interceptors/mcs-http-client.interceptor';
import { McsErrorHandlerInterceptor } from './interceptors/mcs-error-handler.interceptor';
import { IMcsInitializable } from './interfaces/mcs-initializable.interface';

@NgModule({
  declarations: [
    McsSnackBarContainerComponent,
    McsSnackBarRefDirective
  ],
  providers: [
    ...coreProviders,
    ...initializableProviders,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: McsHttpClientInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: McsErrorHandlerInterceptor
    }
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    CookieModule.forRoot()
  ],
  exports: [
    CommonModule,
    HttpClientModule
  ],
  entryComponents: [
    McsSnackBarContainerComponent
  ]
})

export class CoreModule {
  /**
   * Use this method in your root module to provide the CoreModule
   * and it should only be derived once
   */
  public static forRoot(config: () => CoreConfig): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        { provide: CoreConfig, useFactory: config }
      ]
    };
  }

  constructor(
    private _injector: Injector,
    @Optional() @SkipSelf() parentModule: CoreModule,
    private _eventDispatcher: EventBusDispatcherService,
    private _routerHandler: McsRouteHandlerService,
    private _routeSettings: McsRouteSettingsService,
    private _notificationJob: McsNotificationJobService,
    private _notificationContext: McsNotificationContextService,
    _notificationEvents: McsNotificationEventsService,
    _errorHandlerService: McsErrorHandlerService,
    _googleAnalytics: GoogleAnalyticsEventsService,
    _sessionHandlerService: McsSessionHandlerService
  ) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }

    // TODO: Register the providers with initializable interface
    this._registerEvents();
    this._initializeRequiredProviders();
  }

  /**
   * Registers all associated events on core module
   */
  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      McsEvent.sessionTimedOut, this._onSessionTimedOut.bind(this));
  }

  /**
   * Event that emits when session has been timedout
   */
  private _onSessionTimedOut(): void {
    this._disposeInjectors();
  }

  /**
   * Dispose all core injectors/providers
   */
  private _disposeInjectors(): void {
    let disposableInjectors = this._getDisposableInjectors();
    if (isNullOrEmpty(disposableInjectors)) { return; }

    disposableInjectors.forEach((disposableInjector) => {
      if (typeof disposableInjector.dispose === 'function') {
        disposableInjector.dispose();
      }
    });
  }

  /**
   * Returns all disposable injectors of the core providers
   */
  private _getDisposableInjectors(): McsDisposable[] {
    return [
      this._notificationJob,
      this._notificationContext,
      this._routerHandler,
      this._routeSettings
    ];
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
