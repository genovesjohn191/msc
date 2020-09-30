import { changeVmForm } from '../forms';
import {
  WorkflowGroup,
  WorkflowSettings
} from '../workflow-group.interface';
import { LaunchPadWorkflowGroupType } from '../workflow-selector.service';


export class ChangeVmWorkflowGroup implements WorkflowGroup {
  public type: LaunchPadWorkflowGroupType = 'change-vm';

  public parent: WorkflowSettings = {
    type: 'servers.changecvm',
    title: 'Change Virtual Machine',
    properties: changeVmForm
  };

  public children: WorkflowSettings[] = [];
}
