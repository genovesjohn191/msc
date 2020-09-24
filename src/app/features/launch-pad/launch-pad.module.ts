import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import { launchPadRoutes } from './launch-pad.constants';
import { LaunchPadComponent } from './launch-pad.component';
import { LaunchPadService } from './launch-pad.service';
import { DynamicFormModule } from '@app/features-shared/dynamic-form';
import { LaunchPadWorkflowService } from './core/workflow.service';
import { WorkflowGroupDirective } from './core/workflow-group.directive';
import { LaunchPadWorkflowGroupComponent } from './core/workflow-group.component';
import { WorkflowGroupFactory } from './core/workflow-group.factory';
import {
  MatButtonModule,
  MatCardModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatProgressBarModule,
  MatStepperModule,
  MatTableModule,
  MatTooltipModule
} from '@angular/material';
import { LaunchPadWorkflowComponent } from './core/workflow.component';

@NgModule({
  declarations: [
    LaunchPadComponent,
    LaunchPadWorkflowGroupComponent,
    WorkflowGroupDirective,
    LaunchPadWorkflowComponent
  ],
  exports: [
    LaunchPadWorkflowGroupComponent,
    WorkflowGroupDirective,
    LaunchPadWorkflowComponent
  ],
  imports: [
    SharedModule,
    DynamicFormModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatStepperModule,
    MatTooltipModule,
    RouterModule.forChild(launchPadRoutes)
  ],
  entryComponents: [ LaunchPadWorkflowComponent ],
  providers: [
    DynamicFormModule,
    LaunchPadService,
    LaunchPadWorkflowService,
    WorkflowGroupFactory
  ]
})

export class LaunchPadModule { }
