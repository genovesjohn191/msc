import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ComponentFactoryResolver,
  ComponentRef,
  Input
} from '@angular/core';

import {
  Guid,
  isNullOrEmpty
} from '@app/utilities';
import { LaunchPadWorkflowComponent } from './workflow.component';
import { LaunchPadWorkflow } from '../workflows/workflow';
import { WorkflowService } from '../workflows/workflow.service';
import { WorkflowGroupDirective } from '../workflows/workflow-group.directive';
import { FormGroup } from '@angular/forms';
import { Workflow } from '../workflows/workflow.interface';
import { WorkflowGroupConfig } from '../workflows/workflow-group.interface';

@Component({
  selector: 'mcs-launch-pad-workflow-group',
  templateUrl: './workflow-group.component.html',
  styleUrls: ['./workflow-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LaunchPadWorkflowGroupComponent {
  public workflowComponentRef: ComponentRef<LaunchPadWorkflowComponent>[] = [];

  public componentRef: ComponentRef<any>;

  public title: string;

  public serviceId: string;

  @Input()
  public set config(value: WorkflowGroupConfig) {
    if (isNullOrEmpty(value)) {
      return;
    }
    this._renderWorkflowGroup(value);
  }

   @ViewChild(WorkflowGroupDirective, {static: true})
   public workflowGroup: WorkflowGroupDirective;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _workflowService: WorkflowService) { }

  /**
   * Returns validity of combined workflow
   */
  public get valid(): boolean {
    let valid: boolean = true;
    this.workflowComponentRef.forEach(ref => {
      if (ref.instance.included && !ref.instance.valid) {
        valid = false;
      }
    });

    return valid;
  }

  public get forms(): FormGroup[] {
    let formArray: FormGroup[]  = [];
    this.workflowComponentRef.forEach(ref => {
      if (ref.instance.included) {
        formArray.push(ref.instance.formGroup);
      }
    });
    return formArray;
  }

  /**
   * Returns consolidated fields
   */
  public get payload(): Workflow[] {
    let payloadItems: Workflow[] = [];
    this.workflowComponentRef.forEach(ref => {
      let payload = ref.instance.GetRawValue();
      if (!isNullOrEmpty(payload)) {
        payloadItems.push(payload);
      }
    });
    return payloadItems;
  }

  public reset(): void {
    let parentReferenceId = Guid.newGuid().toString();

    this.workflowComponentRef.forEach(ref => {
      // Set new reference IDs
      if (isNullOrEmpty(ref.instance.parentReferenceId)) {
        ref.instance.referenceId = parentReferenceId;
      } else {
        ref.instance.referenceId = Guid.newGuid().toString();
        ref.instance.parentReferenceId = parentReferenceId;
      }

      ref.instance.reset();
    });
  }

  private _renderWorkflowGroup(config: WorkflowGroupConfig): void {
    let workflows: LaunchPadWorkflow[] = this._workflowService.getWorkflowGroup(config);
    this.serviceId = config.serviceId || config.parentServiceId;

    // Clear references and instances of existing workflow
    this.workflowComponentRef = [];
    this.workflowGroup.viewContainerRef.clear();

    if (isNullOrEmpty(workflows)) {
      console.log('No workflow group found.');
      return;
    }

    // Render workflows
    workflows.forEach(workflow => {
      this._renderWorkflow(workflow);
    });
  }

  private _renderWorkflow(param: LaunchPadWorkflow): void {
    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(LaunchPadWorkflowComponent);
    let componentRef = this.workflowGroup.viewContainerRef.createComponent<LaunchPadWorkflowComponent>(componentFactory);

    // Set workflow settings
    componentRef.instance.load(param);

    this.workflowComponentRef.push(componentRef);
  }
}
