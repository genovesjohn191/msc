import { CookieService } from 'ngx-cookie-service';

/** Services */
import { StompRService } from '@stomp/ng2-stompjs';

/** Access Control */
import { McsAccessControlService } from './authentication/mcs-access-control.service';
import { McsAuthenticationGuard } from './authentication/mcs-authentication.guard';
/** Authentication */
import { McsAuthenticationIdentity } from './authentication/mcs-authentication.identity';
import { McsAuthenticationService } from './authentication/mcs-authentication.service';
/** Guards */
import { McsNavigateAwayGuard } from './guards/mcs-navigate-away.guard';
import { McsRequiredResourcesGuard } from './guards/mcs-required-resources.guard';
/** Providers */
import { McsAssetsProvider } from './providers/mcs-assets.provider';
import { GoogleAnalyticsEventsService } from './services/google-analytics-events.service';
import { McsBrowserService } from './services/mcs-browser.service';
import { McsComponentHandlerService } from './services/mcs-component-handler.service';
import { McsCookieService } from './services/mcs-cookie.service';
import { McsDateTimeService } from './services/mcs-date-time.service';
import { McsErrorHandlerService } from './services/mcs-error-handler.service';
import { McsFilterService } from './services/mcs-filter.service';
import { McsFormGroupService } from './services/mcs-form-group.service';
import { McsGlobalElementService } from './services/mcs-global-element.service';
import { McsNavigationService } from './services/mcs-navigation.service';
import { McsNotificationContextService } from './services/mcs-notification-context.service';
import { McsNotificationEventsService } from './services/mcs-notification-events.service';
import { McsNotificationJobService } from './services/mcs-notification-job.service';
import { McsPlatformService } from './services/mcs-platform.service';
import { McsRouteHandlerService } from './services/mcs-route-handler.service';
import { McsRouteSettingsService } from './services/mcs-route-settings.service';
import { McsScrollDispatcherService } from './services/mcs-scroll-dispatcher.service';
import { McsSessionHandlerService } from './services/mcs-session-handler.service';
import { McsStorageService } from './services/mcs-storage.service';
import { McsSystemMessageService } from './services/mcs-system-message.service';
import { McsViewportService } from './services/mcs-viewport.service';
import { McsReportingService } from './services/mcs-reporting.service';
import { McsPrivateCloudOnlyGuard } from './guards/mcs-private-cloud-only.guard';
import { McsPublicCloudOnlyGuard } from './guards/mcs-public-cloud-only.guard';
import { McsIpValidatorService } from './services/mcs-ip-validator.service';

/**
 * Array coverage for the core modules
 */
export const coreProviders: any[] = [
  StompRService,
  CookieService,
  McsStorageService,
  McsCookieService,
  McsBrowserService,
  McsNotificationJobService,
  McsNotificationContextService,
  McsNotificationEventsService,
  McsGlobalElementService,
  McsScrollDispatcherService,
  McsViewportService,
  McsErrorHandlerService,
  McsRouteHandlerService,
  McsRouteSettingsService,
  McsPlatformService,
  McsFormGroupService,
  McsAssetsProvider,
  McsFilterService,
  McsAuthenticationIdentity,
  McsAuthenticationService,
  McsAuthenticationGuard,
  McsAccessControlService,
  McsNavigateAwayGuard,
  McsPrivateCloudOnlyGuard,
  McsPublicCloudOnlyGuard,
  McsRequiredResourcesGuard,
  GoogleAnalyticsEventsService,
  McsSessionHandlerService,
  McsComponentHandlerService,
  McsDateTimeService,
  McsNavigationService,
  McsSystemMessageService,
  McsReportingService,
  McsIpValidatorService
];
