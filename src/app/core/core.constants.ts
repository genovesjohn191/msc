/** Services */
import { McsApiService } from './services/mcs-api.service';
import { McsStorageService } from './services/mcs-storage.service';
import { McsBrowserService } from './services/mcs-browser.service';
import { McsNotificationJobService } from './services/mcs-notification-job.service';
import { McsNotificationContextService } from './services/mcs-notification-context.service';
/** Providers */
import { McsTextContentProvider } from './providers/mcs-text-content.provider';
import { McsAssetsProvider } from './providers/mcs-assets.provider';
import { McsFilterProvider } from './providers/mcs-filter.provider';
/** Authentication */
import { McsAuthenticationIdentity } from './authentication/mcs-authentication.identity';
import { McsAuthenticationService } from './authentication/mcs-authentication.service';
import { McsAuthenticationGuard } from './authentication/mcs-authentication.guard';

/**
 * Array coverage for the core modules
 */
export const coreProviders: any[] = [
  McsApiService,
  McsStorageService,
  McsBrowserService,
  McsNotificationJobService,
  McsNotificationContextService,
  McsTextContentProvider,
  McsAssetsProvider,
  McsFilterProvider,
  McsAuthenticationIdentity,
  McsAuthenticationService,
  McsAuthenticationGuard
];
