import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
/** Configuration */
import { CoreConfig } from './core.config';
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
import { McsAuthenticationService } from './authentication/mcs-authentication.service';
import { McsAuthenticationGuard } from './authentication/mcs-authentication.guard';

@NgModule({
  providers: [
    McsApiService,
    McsStorageService,
    McsBrowserService,
    McsNotificationJobService,
    McsNotificationContextService,
    McsTextContentProvider,
    McsAssetsProvider,
    McsFilterProvider,
    McsAuthenticationService,
    McsAuthenticationGuard
  ]
})

export class CoreModule {
  public static forRoot(config: CoreConfig): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        { provide: CoreConfig, useValue: config }
      ]
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
