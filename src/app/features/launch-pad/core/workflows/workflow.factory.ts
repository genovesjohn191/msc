import { Injectable } from '@angular/core';
import { WorkflowType } from '@app/models';

import {
  cloneDeep,
  Guid,
  isNullOrEmpty } from '@app/utilities';
import { LaunchPadWorkflow } from './workflow';
import {
  WorkflowGroup,
  WorkflowGroupConfig
} from './workflow-group.interface';
import {
  WorkflowConfig,
  WorkflowData
} from './workflow.interface';

interface NewWorkflowGroupConfig {
  workflowGroup: WorkflowGroup;
  config: WorkflowGroupConfig;
}

@Injectable()
export class WorkflowFactory {

  public createWorkflows(options: NewWorkflowGroupConfig): LaunchPadWorkflow[] {
    let workflows: LaunchPadWorkflow[] = [];

    let parentWorkflow = this._createParentWorkflow(options);
    workflows.push(parentWorkflow);
    this._appendChildWorkflows(
      workflows,
      parentWorkflow.referenceId,
      options.workflowGroup.children,
      options.config.children);

    return workflows;
  }

  private _createParentWorkflow(options: NewWorkflowGroupConfig): LaunchPadWorkflow {
    return new LaunchPadWorkflow({
      type: options.workflowGroup.parent.id,
      referenceId: options.config.parent.referenceId  || Guid.newGuid().toString(),
      serviceId: options.config.parent.serviceId || '',
      title: options.workflowGroup.parent.title,
      required: true,
      // Clone the form to ensure data is not persisted
      properties: cloneDeep(options.workflowGroup.parent.form.config),
      data: options.config.parent.propertyOverrides
    });
  }

  private _appendChildWorkflows(
    workflows: LaunchPadWorkflow[],
    parentId: string,
    config: WorkflowConfig[],
    data: WorkflowData[]
  ): void {

    if (!isNullOrEmpty(config)) {

      config.forEach((child) => {
        // Resolve data override
        let dataOverride = this._resolveOverrideData(child.id, data);

        let childWorkflow = new LaunchPadWorkflow({
          type: child.id,
          referenceId: Guid.newGuid().toString(),
          parentReferenceId: parentId,
          title: child.title,
          required: child.required,
          // Clone the form to ensure data is not persisted
          properties: cloneDeep(child.form.config),
          data: dataOverride

        });
        workflows.push(childWorkflow);
      });
    }
  }

  private _resolveOverrideData(id: WorkflowType, data: WorkflowData[]): { key: string, value: any }[] {
    let propertyOverrides = [];
    if (isNullOrEmpty(data)) {
      return propertyOverrides;
    }

    let result = data.find((conf) => conf.id === id);
    if (!isNullOrEmpty(result)) {
      propertyOverrides = result.propertyOverrides;
    }

    return propertyOverrides;
  }
}
