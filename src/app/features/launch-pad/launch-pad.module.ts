import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McsStorageService } from '@app/core';
import { DynamicFormModule } from '@app/features-shared';
import { ConfirmationDialogDialogComponent, SharedModule } from '@app/shared';

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
import { AzureDeploymentActivitiesComponent } from './azure-deployments/azure-deployment/history/azure-deployment-history.component';
import { AzureDeploymentResolver } from './azure-deployments/azure-deployment/azure-deployment.resolver';
import { AzureDeploymentComponent } from './azure-deployments/azure-deployment/azure-deployment.component';
import { AzureDeploymentOverviewComponent } from './azure-deployments/azure-deployment/overview/azure-deployment-overview.component';
import { AzureDeploymentService } from './azure-deployments/azure-deployment/azure-deployment.service';

@NgModule({
  declarations: [
    // Workflows
    LaunchPadSearchComponent,
    LaunchPadSearchElementsResultComponent,
    LaunchPadSearchServicesResultComponent,
    LaunchPadWorkflowsComponent,
    LaunchPadWorkflowLaunchComponent,
    // Azure Deployments
    AzureDeploymentActivitiesComponent,
    AzureDeploymentOverviewComponent,
    AzureDeploymentCreateComponent,
    AzureDeploymentsComponent,
    AzureDeploymentComponent,
    // Shared
    ConfirmationDialogDialogComponent
  ],
  exports: [
    AzureDeploymentActivitiesComponent,
    AzureDeploymentOverviewComponent,
    ConfirmationDialogDialogComponent
  ],
  entryComponents: [
    ConfirmationDialogDialogComponent
  ],
  imports: [
    SharedModule,
    LaunchPadCoreModule,
    DynamicFormModule,
    RouterModule.forChild(launchPadRoutes)
  ],
  providers: [
    McsStorageService,
    LaunchPadGuard,
    DynamicFormModule,
    AzureDeploymentResolver,
    AzureDeploymentService
  ]
})

export class LaunchPadModule { }
