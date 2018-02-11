/** Services */
import { McsApiService } from './services/mcs-api.service';
import { McsStorageService } from './services/mcs-storage.service';
import { McsCookieService } from './services/mcs-cookie.service';
import { McsBrowserService } from './services/mcs-browser.service';
import { McsNotificationJobService } from './services/mcs-notification-job.service';
import { McsNotificationContextService } from './services/mcs-notification-context.service';
import { McsNotificationEventsService } from './services/mcs-notification-events.service';
import { McsDialogService } from './services/mcs-dialog.service';
import { McsOverlayService } from './services/mcs-overlay.service';
import { McsScrollDispatcherService } from './services/mcs-scroll-dispatcher.service';
import { McsViewportService } from './services/mcs-viewport.service';
import { McsErrorHandlerService } from './services/mcs-error-handler.service';
import { McsPlatformService } from './services/mcs-platform.service';
import { McsLoggerService } from './services/mcs-logger.service';
/** Providers */
import { McsTextContentProvider } from './providers/mcs-text-content.provider';
import { McsAssetsProvider } from './providers/mcs-assets.provider';
import { McsFilterProvider } from './providers/mcs-filter.provider';
/** Authentication */
import { McsAuthenticationIdentity } from './authentication/mcs-authentication.identity';
import { McsAuthenticationService } from './authentication/mcs-authentication.service';
import { McsAuthenticationGuard } from './authentication/mcs-authentication.guard';
import { McsRoutePermissionGuard } from './authentication/mcs-route-permission.guard';
/** Google Analytics */
import { GoogleAnalyticsEventsService } from './services/google-analytics-events.service';
/** Forms */
import { McsNavigateAwayGuard } from './forms/mcs-navigate-away.guard';
/**
 * Array coverage for the core modules
 */
export const coreProviders: any[] = [
  McsApiService,
  McsStorageService,
  McsCookieService,
  McsBrowserService,
  McsNotificationJobService,
  McsNotificationContextService,
  McsNotificationEventsService,
  McsOverlayService,
  McsDialogService,
  McsScrollDispatcherService,
  McsViewportService,
  McsErrorHandlerService,
  McsPlatformService,
  McsLoggerService,
  McsTextContentProvider,
  McsAssetsProvider,
  McsFilterProvider,
  McsAuthenticationIdentity,
  McsAuthenticationService,
  McsAuthenticationGuard,
  McsRoutePermissionGuard,
  McsNavigateAwayGuard,
  GoogleAnalyticsEventsService
];
