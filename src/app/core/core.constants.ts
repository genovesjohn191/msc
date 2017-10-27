/** Services */
import { McsApiService } from './services/mcs-api.service';
import { McsStorageService } from './services/mcs-storage.service';
import { McsBrowserService } from './services/mcs-browser.service';
import { McsNotificationJobService } from './services/mcs-notification-job.service';
import { McsNotificationContextService } from './services/mcs-notification-context.service';
import { McsDialogService } from './services/mcs-dialog.service';
import { McsOverlayService } from './services/mcs-overlay.service';
import { McsScrollDispatcherService } from './services/mcs-scroll-dispatcher.service';
import { McsViewportRulerService } from './services/mcs-viewport-ruler.service';
/** Providers */
import { McsTextContentProvider } from './providers/mcs-text-content.provider';
import { McsAssetsProvider } from './providers/mcs-assets.provider';
import { McsFilterProvider } from './providers/mcs-filter.provider';
/** Authentication */
import { McsAuthenticationIdentity } from './authentication/mcs-authentication.identity';
import { McsAuthenticationService } from './authentication/mcs-authentication.service';
import { McsAuthenticationGuard } from './authentication/mcs-authentication.guard';
import { McsRoutePermissionGuard } from './authentication/mcs-route-permission.guard';

/**
 * Array coverage for the core modules
 */
export const coreProviders: any[] = [
  McsApiService,
  McsStorageService,
  McsBrowserService,
  McsNotificationJobService,
  McsNotificationContextService,
  McsOverlayService,
  McsDialogService,
  McsScrollDispatcherService,
  McsViewportRulerService,
  McsTextContentProvider,
  McsAssetsProvider,
  McsFilterProvider,
  McsAuthenticationIdentity,
  McsAuthenticationService,
  McsAuthenticationGuard,
  McsRoutePermissionGuard
];
