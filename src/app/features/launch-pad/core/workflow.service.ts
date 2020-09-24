import {
  Injectable,
  Type
} from '@angular/core';
import { LaunchPadWorkflow } from './workflow';
import { WorkflowGroupFactory } from './workflow-group.factory';
import { LaunchPadWorkflowGroupType, WorkflowGroup } from './workflow-group.interface';
import { NewCvmWorkflowGroup } from './workflow-groups/new-cvm-workflow-group';

export interface WorkflowGroupLaunchSettings {
  type: LaunchPadWorkflowGroupType;
  serviceId?: string;
  parentServiceId?: string;
}

@Injectable()
export class LaunchPadWorkflowService {
  private workflowGroupMap: Map<LaunchPadWorkflowGroupType, Type<WorkflowGroup>>;

  public constructor(private _workflowGroupFactory: WorkflowGroupFactory) {
    this._createWorkflowGroupMap();
  }

  public getWorkflowGroup(config: WorkflowGroupLaunchSettings): LaunchPadWorkflow[] {
    let workflowGroupType = this.workflowGroupMap.get(config.type);
    return this._workflowGroupFactory.createWorkflowGroup({
      workflowGroup: new workflowGroupType(),
      serviceId: config.serviceId,
      parentServiceId: config.parentServiceId
    });
  }

  private _createWorkflowGroupMap(): void {
    this.workflowGroupMap = new Map<LaunchPadWorkflowGroupType, Type<WorkflowGroup>>();
    this.workflowGroupMap.set('new-cvm', NewCvmWorkflowGroup);
  }
}
