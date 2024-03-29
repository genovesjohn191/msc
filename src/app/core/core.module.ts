import { CommonModule } from '@angular/common';
import {
  HttpClientModule,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import {
  ErrorHandler,
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  isNullOrEmpty,
  McsDisposable
} from '@app/utilities';

import { CoreConfig } from './core.config';
import { coreProviders } from './core.constants';
import { McsAutomationInterceptor } from './interceptors/mcs-correlation-id.interceptor';
import { McsErrorHandlerInterceptor } from './interceptors/mcs-error-handler.interceptor';
import { McsHttpClientInterceptor } from './interceptors/mcs-http-client.interceptor';
import { GoogleAnalyticsEventsService } from './services/google-analytics-events.service';
import { McsErrorHandlerService } from './services/mcs-error-handler.service';
import { McsNotificationContextService } from './services/mcs-notification-context.service';
import { McsNotificationEventsService } from './services/mcs-notification-events.service';
import { McsNotificationJobService } from './services/mcs-notification-job.service';
import { McsRouteHandlerService } from './services/mcs-route-handler.service';
import { McsRouteSettingsService } from './services/mcs-route-settings.service';
import { McsSessionHandlerService } from './services/mcs-session-handler.service';
import { McsSystemMessageService } from './services/mcs-system-message.service';

@NgModule({
  providers: [
    ...coreProviders,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: McsHttpClientInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: McsErrorHandlerInterceptor
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: McsAutomationInterceptor,
      multi: true
    }
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [
    CommonModule,
    HttpClientModule
  ]
})

export class CoreModule {
  /**
   * Use this method in your root module to provide the CoreModule
   * and it should only be derived once
   */
  public static forRoot(config: () => CoreConfig): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        { provide: CoreConfig, useFactory: config }
      ]
    };
  }

  constructor(
    @Optional() @SkipSelf() parentModule: CoreModule,
    private _eventDispatcher: EventBusDispatcherService,
    private _routerHandler: McsRouteHandlerService,
    private _routeSettings: McsRouteSettingsService,
    private _systemMessageService: McsSystemMessageService,
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
    this._registerEvents();
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
      this._routeSettings,
      this._systemMessageService
    ];
  }
}
