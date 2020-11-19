import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';

import { McsStorageService } from '@app/core';

import { DynamicFormModule } from '@app/features-shared/dynamic-form';

import { WorkflowService } from './workflows/workflow.service';
import { LaunchPadWorkflowSelectorService } from './layout/workflow-selector/workflow-selector.service';
import { WorkflowGroupDirective } from './workflows/workflow-group.directive';
import { WorkflowFactory } from './workflows/workflow.factory';
import { LaunchPadComponent } from './launch-pad-core.component';
import { LaunchPadWorkflowComponent } from './layout/workflow-group/workflow.component';
import { LaunchPadWorkflowSelectorComponent } from './layout/workflow-selector/workflow-selector.component';
import { WorkflowSelectorLauncherComponent } from './layout/workflow-selector/workflow-selector-launcher.component';
import { LaunchPadWorkflowGroupComponent } from './layout/workflow-group/workflow-group.component';
import { WorkflowJsonViewerComponent } from './layout/workflow-json-viewer/workflow-json-viewer.component';
import { LaunchPadLoadStateDialogComponent } from './layout/workflow-load-state-dialog/workflow-load-state-dialog.component';
import { LaunchPadWorkflowProvisionStateComponent } from './layout/workflow-provision-state/workflow-provision-state.component';
import { McsApiService } from '@app/services';
import { LaunchPadServiceIdSwitchDialogComponent } from './layout/service-id-switch-dialog/service-id-switch-dialog.component';

@NgModule({
  declarations: [
    LaunchPadComponent,
    WorkflowSelectorLauncherComponent,
    WorkflowJsonViewerComponent,
    LaunchPadWorkflowGroupComponent,
    WorkflowGroupDirective,
    LaunchPadServiceIdSwitchDialogComponent,
    LaunchPadLoadStateDialogComponent,
    LaunchPadWorkflowComponent,
    LaunchPadWorkflowProvisionStateComponent,
    LaunchPadWorkflowSelectorComponent
  ],
  exports: [
    LaunchPadComponent,
    WorkflowSelectorLauncherComponent,
    WorkflowJsonViewerComponent,
    LaunchPadWorkflowGroupComponent,
    WorkflowGroupDirective,
    LaunchPadServiceIdSwitchDialogComponent,
    LaunchPadLoadStateDialogComponent,
    LaunchPadWorkflowComponent,
    LaunchPadWorkflowProvisionStateComponent,
    LaunchPadWorkflowSelectorComponent
  ],
  imports: [
    SharedModule,
    DynamicFormModule
  ],
  entryComponents: [
    LaunchPadWorkflowComponent,
    LaunchPadWorkflowSelectorComponent,
    LaunchPadServiceIdSwitchDialogComponent,
    LaunchPadLoadStateDialogComponent
  ],
  providers: [
    McsStorageService,
    DynamicFormModule,
    WorkflowService,
    LaunchPadWorkflowSelectorService,
    WorkflowFactory,
    McsApiService
  ]
})

export class LaunchPadCoreModule { }
