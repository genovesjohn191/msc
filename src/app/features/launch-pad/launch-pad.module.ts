import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import { launchPadRoutes } from './launch-pad.constants';
import { CrispOrdersWorkflowComponent } from './crisp-orders/crisp-orders.component';
import { LaunchPadCoreModule } from './core/launch-pad-core.module';
import { McsStorageService } from '@app/core';

@NgModule({
  declarations: [
    CrispOrdersWorkflowComponent,
  ],
  exports: [ ],
  imports: [
    SharedModule,
    LaunchPadCoreModule,
    RouterModule.forChild(launchPadRoutes)
  ],
  providers: [
    McsStorageService
  ]
})

export class LaunchPadModule { }
