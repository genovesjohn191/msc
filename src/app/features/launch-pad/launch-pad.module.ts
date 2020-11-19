import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import { launchPadRoutes } from './launch-pad.constants';
import { LaunchPadCoreModule } from './core/launch-pad-core.module';
import { McsStorageService } from '@app/core';
import { LaunchPadSearchComponent } from './search/launch-pad-search.component';
import { LaunchPadWorkflowLaunchComponent } from './workflows/launch-pad-workflow-launch.component';
import { LaunchPadWorkflowsComponent } from './workflows/launch-pad-workflows.component';
import { LaunchPadSearchElementsResultComponent } from './search/results-table/elements-result.component';
import { LaunchPadSearchServicesResultComponent } from './search/results-table/services-result.component';
import { LaunchPadGuard } from './launch-pad.guard';

@NgModule({
  declarations: [
    LaunchPadSearchComponent,
    LaunchPadSearchElementsResultComponent,
    LaunchPadSearchServicesResultComponent,
    LaunchPadWorkflowsComponent,
    LaunchPadWorkflowLaunchComponent
  ],
  exports: [],
  imports: [
    SharedModule,
    LaunchPadCoreModule,
    RouterModule.forChild(launchPadRoutes)
  ],
  providers: [
    McsStorageService,
    LaunchPadGuard
  ]
})

export class LaunchPadModule { }
