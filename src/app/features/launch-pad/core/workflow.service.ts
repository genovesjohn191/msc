import {
  Injectable,
  Type
} from '@angular/core';
import { LaunchPadWorkflow } from './workflow';
import { WorkflowGroupFactory } from './workflow-group.factory';
import { WorkflowGroup } from './workflow-group.interface';
import { NewCvmWorkflowGroup } from './workflow-groups/new-cvm-workflow-group';
import { LaunchPadWorkflowGroupType } from './workflow-selector.service';

export interface LaunchPadSetting {
  type: LaunchPadWorkflowGroupType;
  serviceId?: string;
  parentServiceId?: string;
  referenceId?: string;
}

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
    });
  }

  private _createWorkflowGroupMap(): void {
    this.workflowGroupMap = new Map<LaunchPadWorkflowGroupType, Type<WorkflowGroup>>();
    this.workflowGroupMap.set('provision-vm', NewCvmWorkflowGroup);
  }
}
