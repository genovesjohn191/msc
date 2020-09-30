import {
  Injectable,
  Type
} from '@angular/core';
import { LaunchPadWorkflow } from './workflow';
import { WorkflowGroupFactory } from './workflow-group.factory';
import { WorkflowGroup } from './workflow-group.interface';
import { ProvisionVmWorkflowGroup } from './workflows/provision-vm-workflow';
import { LaunchPadSetting, LaunchPadWorkflowGroupType } from './workflow-selector.service';
import { ChangeVmWorkflowGroup, ProvisionAvWorkflowGroup } from './workflows';

@Injectable()
export class LaunchPadWorkflowService {
  private workflowGroupMap: Map<LaunchPadWorkflowGroupType, Type<WorkflowGroup>>;

  public constructor(private _workflowGroupFactory: WorkflowGroupFactory) {
    this._createWorkflowGroupMap();
  }

  public getWorkflowGroup(config: LaunchPadSetting): LaunchPadWorkflow[] {
    let workflowGroupType = this.workflowGroupMap.get(config.type);
    return this._workflowGroupFactory.createWorkflowGroup({
      workflowGroup: new workflowGroupType(),
      serviceId: config.serviceId,
      parentServiceId: config.parentServiceId,
      referenceId: config.referenceId,
      parentParams: config.properties
    });
  }

  private _createWorkflowGroupMap(): void {
    this.workflowGroupMap = new Map<LaunchPadWorkflowGroupType, Type<WorkflowGroup>>();
    this.workflowGroupMap.set('provision-vm', ProvisionVmWorkflowGroup);
    this.workflowGroupMap.set('change-vm', ChangeVmWorkflowGroup);
    this.workflowGroupMap.set('provision-av', ProvisionAvWorkflowGroup);
  }
}
