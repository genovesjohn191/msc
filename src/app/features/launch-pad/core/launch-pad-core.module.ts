import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { DynamicFormModule } from '@app/features-shared/dynamic-form';
import { LaunchPadComponent } from './launch-pad.component';
import { LaunchPadWorkflowGroupComponent } from './workflow-group.component';
import { WorkflowGroupDirective } from './workflow-group.directive';
import { LaunchPadWorkflowComponent } from './workflow.component';
import { LaunchPadWorkflowSelectorComponent } from './workflow-selector.component';
import { LaunchPadWorkflowService } from './workflow.service';
import { LaunchPadWorkflowSelectorService } from './workflow-selector.service';
import { WorkflowGroupFactory } from './workflow-group.factory';

@NgModule({
  declarations: [
    LaunchPadComponent,
    LaunchPadWorkflowGroupComponent,
    WorkflowGroupDirective,
    LaunchPadWorkflowComponent,
    LaunchPadWorkflowSelectorComponent
  ],
  exports: [
    LaunchPadComponent,
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
    LaunchPadWorkflowService,
    LaunchPadWorkflowSelectorService,
    WorkflowGroupFactory
  ]
})

export class LaunchPadCoreModule { }
