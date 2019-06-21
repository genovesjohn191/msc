/** Services */
import { StompRService } from '@stomp/ng2-stompjs';
import { McsStorageService } from './services/mcs-storage.service';
import { McsCookieService } from './services/mcs-cookie.service';
import { McsBrowserService } from './services/mcs-browser.service';
import { McsNotificationJobService } from './services/mcs-notification-job.service';
import { McsNotificationContextService } from './services/mcs-notification-context.service';
import { McsNotificationEventsService } from './services/mcs-notification-events.service';
import { McsSnackBarService } from './services/mcs-snack-bar.service';
import { McsGlobalElementService } from './services/mcs-global-element.service';
import { McsOverlayService } from './services/mcs-overlay.service';
import { McsScrollDispatcherService } from './services/mcs-scroll-dispatcher.service';
import { McsViewportService } from './services/mcs-viewport.service';
import { McsErrorHandlerService } from './services/mcs-error-handler.service';
import { McsRouteHandlerService } from './services/mcs-route-handler.service';
import { McsRouteSettingsService } from './services/mcs-route-settings.service';
import { McsPlatformService } from './services/mcs-platform.service';
import { McsLoggerService } from './services/mcs-logger.service';
import { McsFormGroupService } from './services/mcs-form-group.service';
import { GoogleAnalyticsEventsService } from './services/google-analytics-events.service';
import { McsSessionHandlerService } from './services/mcs-session-handler.service';
import { McsComponentHandlerService } from './services/mcs-component-handler.service';
import { McsDateTimeService } from './services/mcs-date-time.service';
import { McsNavigationService } from './services/mcs-navigation.service';

/** Providers */
import { McsAssetsProvider } from './providers/mcs-assets.provider';
import { McsFilterProvider } from './providers/mcs-filter.provider';

/** Authentication */
import { McsAuthenticationIdentity } from './authentication/mcs-authentication.identity';
import { McsAuthenticationService } from './authentication/mcs-authentication.service';
import { McsAuthenticationGuard } from './authentication/mcs-authentication.guard';

/** Access Control */
import { McsAccessControlService } from './authentication/mcs-access-control.service';

/** Guards */
import { McsNavigateAwayGuard } from './guards/mcs-navigate-away.guard';
import { McsRequiredResourcesGuard } from './guards/mcs-required-resources.guard';

/**
 * Array coverage for the core modules
 */
export const coreProviders: any[] = [
  StompRService,
  McsStorageService,
  McsCookieService,
  McsBrowserService,
  McsNotificationJobService,
  McsNotificationContextService,
  McsNotificationEventsService,
  McsGlobalElementService,
  McsOverlayService,
  McsSnackBarService,
  McsScrollDispatcherService,
  McsViewportService,
  McsErrorHandlerService,
  McsRouteHandlerService,
  McsRouteSettingsService,
  McsPlatformService,
  McsLoggerService,
  McsFormGroupService,
  McsAssetsProvider,
  McsFilterProvider,
  McsAuthenticationIdentity,
  McsAuthenticationService,
  McsAuthenticationGuard,
  McsAccessControlService,
  McsNavigateAwayGuard,
  McsRequiredResourcesGuard,
  GoogleAnalyticsEventsService,
  McsSessionHandlerService,
  McsComponentHandlerService,
  McsDateTimeService,
  McsNavigationService
];
