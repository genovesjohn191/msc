import { Injectable } from '@angular/core';
import {
  McsPermission,
  ProductType
} from '@app/models';
import {
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { McsAccessControlService } from '@app/core';

import {
  WorkflowGroup,
  WorkflowGroupConfig
} from './workflow-group.interface';
import { WorkflowFactory } from './workflow.factory';
import { LaunchPadWorkflow } from './workflow';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import { workflowGroupMap } from './workflow-group.map';
import {
  productWorkflowGroupMap,
  WorkflowGroupIdInfo
} from './product-workflow-group.map';
import { workflowPermissionMap } from './workflow-permission.map';

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

  public getWorkflowGroupIdsByProductType(type: ProductType): WorkflowGroupIdInfo[] {
    return productWorkflowGroupMap.get(type);
  }

  public hasAccessToFeature(workflowGroupId: number): boolean {
    let workflowGroup = this._getWorkflowGroupById(workflowGroupId);
    if (isNullOrUndefined(workflowGroup.parent.featureFlag)) { return true }

    return this._accessControlService.hasAccessToFeature(workflowGroup.parent.featureFlag);
  }

  public hasRequiredPermission(workflowGroupId: number): boolean {
    let permission = this._getWorkflowPermission(workflowGroupId);
    if (isNullOrUndefined(permission)) { return true; }

    return this._accessControlService.hasPermission([permission]);
  }

  private _getWorkflowGroupById(id: WorkflowGroupId): WorkflowGroup {
    let workflowGroupType = workflowGroupMap.get(id);
    return new workflowGroupType();
  }

  private _getWorkflowPermission(workflowId: WorkflowGroupId): McsPermission {
    let isWorkflowPrivateCloud = workflowPermissionMap.get(McsPermission.InternalPrivateCloudEngineerAccess)
      .find((workflow) => workflow === workflowId)
    if (isWorkflowPrivateCloud) {
      return McsPermission.InternalPrivateCloudEngineerAccess;
    }

    let isWorkflowPublicCloud = workflowPermissionMap.get(McsPermission.InternalPublicCloudEngineerAccess)
      .find((workflow) => workflow === workflowId);
    if (isWorkflowPublicCloud) {
      return McsPermission.InternalPublicCloudEngineerAccess;
    }
  }
}
