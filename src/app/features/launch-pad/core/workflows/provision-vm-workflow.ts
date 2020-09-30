import {
  hidsForm,
  provisionVmForm,
  serverBackupForm
} from '../forms';
import {
  WorkflowGroup,
  WorkflowSettings
} from '../workflow-group.interface';
import { LaunchPadWorkflowGroupType } from '../workflow-selector.service';


export class ProvisionVmWorkflowGroup implements WorkflowGroup {
  public type: LaunchPadWorkflowGroupType = 'provision-vm';

  public parent: WorkflowSettings = {
    type: 'servers.newcvm',
    title: 'Provision Virtual Machine',
    properties: provisionVmForm
  };

  public children: WorkflowSettings[] = [
    {
      type: 'servers.hids',
      title: 'HIDS',
      properties: hidsForm
    },
    {
      type: 'servers.backup',
      title: 'Server Backup',
      properties: serverBackupForm
    }
  ];
}
