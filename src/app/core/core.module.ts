import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { RouterModule } from '@angular/router';
/** Configuration */
import { CoreConfig } from './core.config';
/** Services/Providers */
import { coreProviders } from './core.constants';
/** Dialog */
import { McsDialogContainerComponent } from './factory/dialog/mcs-dialog-container.component';
import { McsDialogRefDirective } from './factory/dialog/mcs-dialog-ref.directive';

@NgModule({
  declarations: [
    McsDialogContainerComponent,
    McsDialogRefDirective
  ],
  providers: [
    ...coreProviders
  ],
  imports: [RouterModule],
  exports: [RouterModule],
  entryComponents: [McsDialogContainerComponent]
})

export class CoreModule {
  public static forRoot(config: () => CoreConfig): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        { provide: CoreConfig, useFactory: config }
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
