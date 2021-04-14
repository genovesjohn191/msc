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
import { DeploymentCreateAzureComponent } from './deployments/azure-deployment-create/azure-deployment-create.component';
import { DynamicFormModule } from '@app/features-shared';
import { QuillModule} from 'ngx-quill';

@NgModule({
  declarations: [
    LaunchPadSearchComponent,
    LaunchPadSearchElementsResultComponent,
    LaunchPadSearchServicesResultComponent,
    LaunchPadWorkflowsComponent,
    LaunchPadWorkflowLaunchComponent,
    DeploymentCreateAzureComponent
  ],
  exports: [],
  imports: [
    SharedModule,
    LaunchPadCoreModule,
    DynamicFormModule,
    QuillModule.forRoot(),
    RouterModule.forChild(launchPadRoutes)
  ],
  providers: [
    McsStorageService,
    LaunchPadGuard,
    DynamicFormModule
  ]
})

export class LaunchPadModule { }
