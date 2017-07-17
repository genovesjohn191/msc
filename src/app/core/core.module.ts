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
import { McsAuthService } from './services/mcs-auth.service';
import { McsStorageService } from './services/mcs-storage.service';
import { McsBrowserService } from './services/mcs-browser.service';
import { McsNotificationJobService } from './services/mcs-notification-job.service';
import { McsNotificationContextService } from './services/mcs-notification-context.service';
import { RedirectService } from './services/redirect.service';
/** Providers */
import { McsTextContentProvider } from './providers/mcs-text-content.provider';
import { McsAssetsProvider } from './providers/mcs-assets.provider';
import { McsFilterProvider } from './providers/mcs-filter.provider';

@NgModule({
  providers: [
    McsAuthService,
    McsApiService,
    McsStorageService,
    McsBrowserService,
    McsNotificationJobService,
    McsNotificationContextService,
    RedirectService,
    McsTextContentProvider,
    McsAssetsProvider,
    McsFilterProvider
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
