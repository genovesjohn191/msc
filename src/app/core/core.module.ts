import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  McsDisposable,
  isNullOrEmpty
} from '@app/utilities';
import { CoreConfig } from './core.config';
import { coreProviders } from './core.constants';
import { CoreEvent } from './core.event';
import { McsDialogContainerComponent } from './factory/dialog/mcs-dialog-container.component';
import { McsDialogRefDirective } from './factory/dialog/mcs-dialog-ref.directive';
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

@NgModule({
  declarations: [
    McsDialogContainerComponent,
    McsDialogRefDirective,
    McsSnackBarContainerComponent,
    McsSnackBarRefDirective
  ],
  providers: [
    ...coreProviders,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: McsHttpClientInterceptor,
      multi: true
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
    McsDialogContainerComponent,
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
  }

  /**
   * Registers all associated events on core module
   */
  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      CoreEvent.sessionTimedOut, this._onSessionTimedOut.bind(this));
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
}
