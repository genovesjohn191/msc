import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import { launchPadRoutes } from './launch-pad.constants';
import { CrispOrdersWorkflowComponent } from './crisp-orders/crisp-orders.component';
import { LaunchPadCoreModule } from './core/launch-pad-core.module';
import { LaunchPadWorkflowGroupComponent } from './core/layout/workflow-group.component';

@NgModule({
  declarations: [
    CrispOrdersWorkflowComponent
  ],
  exports: [
    LaunchPadWorkflowGroupComponent
  ],
  imports: [
    SharedModule,
    LaunchPadCoreModule,
    RouterModule.forChild(launchPadRoutes)
  ]
})

export class LaunchPadModule { }
