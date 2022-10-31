import { Injectable } from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { workflowOptions } from '../workflow-options.map';
import { WorkflowGroupId, workflowGroupIdText } from '../../core/workflow-groups/workflow-group-type.enum';
import { WorkflowService } from '../../core/workflow.service';
import { WorkflowGroupIdInfo } from '../../core/product-workflow-group.map';
import { WorkflowSelectorConfig } from './workflow-selector.component';

export interface WorkflowSelectorItem {
  id: WorkflowGroupId;
  name: string;
  description: string;
}

@Injectable()
export class LaunchPadWorkflowSelectorService {

  constructor(
    private _workflowService: WorkflowService
  ) { }

  public getOptionsById(ids: WorkflowGroupId[]): WorkflowSelectorItem[] {
    let items: WorkflowSelectorItem[] = [];

    if (isNullOrEmpty(ids)) {
      return items;
    }

    ids.forEach(id => {
      let description = workflowOptions.get(id);
      let isWorkflowValid = this._workflowService.hasAccessToFeature(id) &&
        !isNullOrEmpty(description) &&
        this._workflowService.hasRequiredPermission(id);

      if (isWorkflowValid) {
        items.push({
          id,
          name: workflowGroupIdText[id],
          description
        });
      }
    });

    return items;
  }

  public getWorkflowGroupIdsBasedOnAllowedStatus(
    data: WorkflowSelectorConfig,
    workflowGroups: WorkflowGroupIdInfo[]): WorkflowGroupId[] {

    let allowedWorkflowGroupIdsBasedOnStatus: WorkflowGroupId[] = [];

    workflowGroups.forEach((group) => {
      let isWorkflowValid = this._workflowService.hasAccessToFeature(group.workflowId) &&
        this._workflowService.hasRequiredPermission(group.workflowId);

      if (!isWorkflowValid) {
        return false;
      }

      if (isNullOrEmpty(group?.allowedElementStatuses) || data.source === 'installed-services') { 
        return allowedWorkflowGroupIdsBasedOnStatus.push(group.workflowId);
      }
      let statusFound = group.allowedElementStatuses.find((status) => status === data.status);

      if (statusFound) {
        return allowedWorkflowGroupIdsBasedOnStatus.push(group.workflowId);
      }
    });

    return allowedWorkflowGroupIdsBasedOnStatus;
  }
}