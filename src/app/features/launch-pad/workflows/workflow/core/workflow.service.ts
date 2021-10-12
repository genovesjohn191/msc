import { Injectable } from '@angular/core';
import { ProductType } from '@app/models';
import {
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

import {
  WorkflowGroup,
  WorkflowGroupConfig
} from './workflow-group.interface';
import { WorkflowFactory } from './workflow.factory';
import { LaunchPadWorkflow } from './workflow';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import { workflowGroupMap } from './workflow-group.map';
import { productWorkflowGroupMap } from './product-workflow-group.map';
import { McsAccessControlService } from '@app/core';

@Injectable()
export class WorkflowService {
  public constructor(
    private _workflowFactory: WorkflowFactory,
    private _accessControlService: McsAccessControlService) { }

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

  public hasAccessToFeature(workflowGroupId: number): boolean {
    let workflowGroup = this._getWorkflowGroupById(workflowGroupId);
    if (isNullOrUndefined(workflowGroup.parent.featureFlag)) { return true }

    return this._accessControlService.hasAccessToFeature(workflowGroup.parent.featureFlag);
  }

  private _getWorkflowGroupById(id: WorkflowGroupId): WorkflowGroup {
    let workflowGroupType = workflowGroupMap.get(id);
    return new workflowGroupType();
  }
}
