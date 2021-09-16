import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';

import { McsStorageService } from '@app/core';

import { WorkflowService } from './core/workflow.service';
import { LaunchPadWorkflowSelectorService } from './shared-layout/workflow-selector/workflow-selector.service';
import { WorkflowGroupDirective } from './core/workflow-group.directive';
import { WorkflowFactory } from './core/workflow.factory';
import { LaunchPadWorkflowCoreComponent } from './workflow-core.component';
import { LaunchPadWorkflowComponent } from './shared-layout/workflow-group/workflow.component';
import { LaunchPadWorkflowSelectorComponent } from './shared-layout/workflow-selector/workflow-selector.component';
import { WorkflowSelectorLauncherComponent } from './shared-layout/workflow-selector/workflow-selector-launcher.component';
import { LaunchPadWorkflowGroupComponent } from './shared-layout/workflow-group/workflow-group.component';
import { LaunchPadLoadStateDialogComponent } from './shared-layout/workflow-load-state-dialog/workflow-load-state-dialog.component';
import { LaunchPadWorkflowProvisionStateComponent } from './shared-layout/workflow-provision-state/workflow-provision-state.component';
import { McsApiService } from '@app/services';
import { LaunchPadServiceIdSwitchDialogComponent } from './shared-layout/service-id-switch-dialog/service-id-switch-dialog.component';
import { LaunchPadObjectSelectorComponent } from './shared-layout/workflow-group/object-selector.component';
import { FeaturesSharedModule } from '@app/features-shared';

@NgModule({
  declarations: [
    LaunchPadWorkflowCoreComponent,
    WorkflowSelectorLauncherComponent,
    LaunchPadWorkflowGroupComponent,
    WorkflowGroupDirective,
    LaunchPadServiceIdSwitchDialogComponent,
    LaunchPadLoadStateDialogComponent,
    LaunchPadWorkflowComponent,
    LaunchPadWorkflowProvisionStateComponent,
    LaunchPadWorkflowSelectorComponent,
    LaunchPadObjectSelectorComponent
  ],
  exports: [
    LaunchPadWorkflowCoreComponent,
    WorkflowSelectorLauncherComponent,
    LaunchPadWorkflowGroupComponent,
    WorkflowGroupDirective,
    LaunchPadServiceIdSwitchDialogComponent,
    LaunchPadLoadStateDialogComponent,
    LaunchPadWorkflowComponent,
    LaunchPadWorkflowProvisionStateComponent,
    LaunchPadWorkflowSelectorComponent,
    LaunchPadObjectSelectorComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule
  ],
  entryComponents: [
    LaunchPadWorkflowComponent,
    LaunchPadWorkflowSelectorComponent,
    LaunchPadServiceIdSwitchDialogComponent,
    LaunchPadLoadStateDialogComponent
  ],
  providers: [
    McsStorageService,
    WorkflowService,
    LaunchPadWorkflowSelectorService,
    WorkflowFactory,
    McsApiService
  ]
})

export class LaunchPadWorkflowCoreModule { }
