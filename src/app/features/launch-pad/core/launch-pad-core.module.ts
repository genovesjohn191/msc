import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';

import { DynamicFormModule } from '@app/features-shared/dynamic-form';

import { WorkflowService } from './workflows/workflow.service';
import { LaunchPadWorkflowSelectorService } from './layout/workflow-selector.service';
import { WorkflowGroupDirective } from './workflows/workflow-group.directive';
import { WorkflowFactory } from './workflows/workflow.factory';

import { LaunchPadComponent } from './launch-pad-core.component';
import { LaunchPadWorkflowComponent } from './layout//workflow.component';
import { LaunchPadWorkflowSelectorComponent } from './layout//workflow-selector.component';
import { WorkflowSelectorLauncherComponent } from './layout//workflow-selector-launcher.component';
import { LaunchPadWorkflowGroupComponent } from './layout/workflow-group.component';

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
