import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import { launchPadRoutes } from './launch-pad.constants';
import { LaunchPadWorkflowGroupComponent } from './core/workflow-group.component';
import { CrispOrdersWorkflowComponent } from './crisp-orders/crisp-orders.component';
import { LaunchPadCoreModule } from './core/launch-pad-core.module';

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
