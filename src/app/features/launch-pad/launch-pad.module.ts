import { QuillModule } from 'ngx-quill';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McsStorageService } from '@app/core';
import { DynamicFormModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';

import { LaunchPadCoreModule } from './core/launch-pad-core.module';
import { AzureDeploymentCreateComponent } from './azure-deployments/azure-deployment-create/azure-deployment-create.component';
import { AzureDeploymentsComponent } from './azure-deployments/azure-deployments.component';
/** Components */
import { launchPadRoutes } from './launch-pad.constants';
import { LaunchPadGuard } from './launch-pad.guard';
import { LaunchPadSearchComponent } from './search/launch-pad-search.component';
import { LaunchPadSearchElementsResultComponent } from './search/results-table/elements-result.component';
import { LaunchPadSearchServicesResultComponent } from './search/results-table/services-result.component';
import { LaunchPadWorkflowLaunchComponent } from './workflows/launch-pad-workflow-launch.component';
import { LaunchPadWorkflowsComponent } from './workflows/launch-pad-workflows.component';

@NgModule({
  declarations: [
    LaunchPadSearchComponent,
    LaunchPadSearchElementsResultComponent,
    LaunchPadSearchServicesResultComponent,
    LaunchPadWorkflowsComponent,
    LaunchPadWorkflowLaunchComponent,

    AzureDeploymentsComponent,
    AzureDeploymentCreateComponent
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
