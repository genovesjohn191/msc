import { Injectable } from '@angular/core';
import { Guid } from '@app/utilities';
import { LaunchPadWorkflow } from './workflow';
import { WorkflowGroup } from './workflow-group.interface';

@Injectable()
export class WorkflowGroupFactory {

  public createWorkflowGroup(options: {
      workflowGroup: WorkflowGroup;
      referenceId?: string;
      serviceId?: string;
      parentServiceId?: string;
      parentParams?: [{ key: string, value: any }];
    }): LaunchPadWorkflow[] {

    let workflows: LaunchPadWorkflow[] = [];

    // Create parent
    // parentParams.push({{ key: workflowGroup.parent., value: any }});
    let parentWorkflow = new LaunchPadWorkflow({
      type: options.workflowGroup.parent.type,
      referenceId: options.referenceId  || Guid.newGuid().toString(),
      serviceId: options.serviceId || '',
      parentServiceId: options.parentServiceId || '',
      title: options.workflowGroup.parent.title,
      required: true,
      properties: options.workflowGroup.parent.properties,
      params: options.parentParams
    });
    workflows.push(parentWorkflow);

    // Create children
    options.workflowGroup.children.forEach((child) => {
      let childWorkflow = new LaunchPadWorkflow({
        type: child.type,
        referenceId: Guid.newGuid().toString(),
        parentReferenceId: parentWorkflow.referenceId,
        title: child.title,
        required: child.required,
        properties: child.properties
      });
      workflows.push(childWorkflow);
    });

    return workflows;
  }
}
