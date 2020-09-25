import {
  hidsForm,
  newCvmForm,
  serverBackupForm
} from '../forms';
import {
  WorkflowGroup,
  WorkflowSettings
} from '../workflow-group.interface';
import { LaunchPadWorkflowGroupType } from '../workflow-selector.service';


export class NewCvmWorkflowGroup implements WorkflowGroup {
  public type: LaunchPadWorkflowGroupType = 'provision-vm';

  public parent: WorkflowSettings = {
    type: 'servers.newcvm',
    title: 'New CVM',
    properties: newCvmForm
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
