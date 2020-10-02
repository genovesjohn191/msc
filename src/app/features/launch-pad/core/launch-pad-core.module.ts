import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';

import { DynamicFormModule } from '@app/features-shared/dynamic-form';

import { WorkflowService } from './workflows/workflow.service';
import { LaunchPadWorkflowSelectorService } from './workflow-selector.service';
import { WorkflowGroupDirective } from './workflows/workflow-group.directive';
import { WorkflowFactory } from './workflows/workflow.factory';

import { LaunchPadComponent } from './launch-pad.component';
import { LaunchPadWorkflowGroupComponent } from './workflow-group.component';
import { LaunchPadWorkflowComponent } from './workflow.component';
import { LaunchPadWorkflowSelectorComponent } from './workflow-selector.component';
import { WorkflowSelectorLauncherComponent } from './workflow-selector-launcher.component';

@NgModule({
  declarations: [
    LaunchPadComponent,
    WorkflowSelectorLauncherComponent,
    LaunchPadWorkflowGroupComponent,
    WorkflowGroupDirective,
    LaunchPadWorkflowComponent,
    LaunchPadWorkflowSelectorComponent
  ],
  exports: [
    LaunchPadComponent,
    WorkflowSelectorLauncherComponent,
    LaunchPadWorkflowGroupComponent,
    WorkflowGroupDirective,
    LaunchPadWorkflowComponent,
    LaunchPadWorkflowSelectorComponent
  ],
  imports: [
    SharedModule,
    DynamicFormModule
  ],
  entryComponents: [
    LaunchPadWorkflowComponent,
    LaunchPadWorkflowSelectorComponent
  ],
  providers: [
    DynamicFormModule,
    WorkflowService,
    LaunchPadWorkflowSelectorService,
    WorkflowFactory
  ]
})

export class LaunchPadCoreModule { }
