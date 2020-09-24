import {
  hidsForm,
  newCvmForm,
  serverBackupForm
} from '../forms';
import {
  LaunchPadWorkflowGroupType,
  WorkflowGroup,
  WorkflowSettings
} from '../workflow-group.interface';


export class NewCvmWorkflowGroup implements WorkflowGroup {
  public type: LaunchPadWorkflowGroupType = 'new-cvm';

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
