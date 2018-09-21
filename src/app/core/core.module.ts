import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoreConfig } from './core.config';
import { coreProviders } from './core.constants';
import { McsDialogContainerComponent } from './factory/dialog/mcs-dialog-container.component';
import { McsDialogRefDirective } from './factory/dialog/mcs-dialog-ref.directive';
import {
  McsSnackBarContainerComponent
} from './factory/snack-bar/mcs-snack-bar-container.component';
import { McsSnackBarRefDirective } from './factory/snack-bar/mcs-snack-bar-ref.directive';

@NgModule({
  declarations: [
    McsDialogContainerComponent,
    McsDialogRefDirective,
    McsSnackBarContainerComponent,
    McsSnackBarRefDirective
  ],
  providers: [
    ...coreProviders
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    RouterModule
  ],
  entryComponents: [
    McsDialogContainerComponent,
    McsSnackBarContainerComponent
  ]
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

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
