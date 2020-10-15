import { Injectable } from '@angular/core';
import { cloneDeep, Guid, isNullOrEmpty } from '@app/utilities';
import { LaunchPadWorkflow } from './workflow';
import { WorkflowGroup } from './workflow-group.interface';
import { WorkflowConfig } from './workflow.interface';

interface NewWorkflowGroupConfig {
  workflowGroup: WorkflowGroup;
  referenceId?: string;
  serviceId?: string;
  parentServiceId?: string;
  parentParams?: { key: string, value: any }[];
}

@Injectable()
export class WorkflowFactory {

  public createWorkflows(options: NewWorkflowGroupConfig): LaunchPadWorkflow[] {
    let workflows: LaunchPadWorkflow[] = [];

    let parentWorkflow = this._createParentWorkflow(options);
    workflows.push(parentWorkflow);
    this._appendChildWorkflows(parentWorkflow.serviceId, options.workflowGroup.children, workflows);

    return workflows;
  }

  private _createParentWorkflow(config: NewWorkflowGroupConfig): LaunchPadWorkflow {
    return new LaunchPadWorkflow({
      type: config.workflowGroup.parent.id,
      referenceId: config.referenceId  || Guid.newGuid().toString(),
      serviceId: config.serviceId || '',
      parentServiceId: config.parentServiceId || '',
      title: config.workflowGroup.parent.title,
      required: true,
      // Clone the form
      properties: cloneDeep(config.workflowGroup.parent.form),
      // Pass initial values
      params: config.parentParams
    });
  }

  private _appendChildWorkflows(parentServiceId: string, config: WorkflowConfig[], workflows: LaunchPadWorkflow[]): void {
    if (!isNullOrEmpty(config)) {
      config.forEach((child) => {
        let childWorkflow = new LaunchPadWorkflow({
          type: child.id,
          referenceId: Guid.newGuid().toString(),
          parentReferenceId: parentServiceId,
          title: child.title,
          required: child.required,
          // Clone the form
          properties: cloneDeep(child.form)
          // Pass initial values

        });
        workflows.push(childWorkflow);
      });
    }
  }
}
