import { Injectable } from '@angular/core';
import { ProductType } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

import { WorkflowGroupConfig } from './workflow-group.interface';
import { WorkflowFactory } from './workflow.factory';
import { LaunchPadWorkflow } from './workflow';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import { workflowGroupMap } from './workflow-group.map';
import { productWorkflowGroupMap } from './product-workflow-group.map';

@Injectable()
export class WorkflowService {
  public constructor(private _workflowFactory: WorkflowFactory) { }

  public getWorkflowGroup(config: WorkflowGroupConfig): LaunchPadWorkflow[] {
    let workflowGroup = workflowGroupMap.get(config.id);
    if (isNullOrEmpty(workflowGroup)) {
      return [];
    }

    return this._workflowFactory.createWorkflows({
      workflowGroup: new workflowGroup(),
      config
    });
  }

  public getWorkflowGroupIdsByProductType(type: ProductType): WorkflowGroupId[] {
    return productWorkflowGroupMap.get(type);
  }
}
