import { WorkflowIdType } from '@app/models';
import {
  WorkflowGroup
} from '../workflow-group.interface';
import {
  hidsForm,
  provisionVmForm,
  serverBackupForm
} from '../forms';
import { WorkflowConfig } from '../workflow.interface';

export class ProvisionVmWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowIdType.ProvisionVm,
    title: 'Provision Virtual Machine',
    form: provisionVmForm
  };

  public children: WorkflowConfig[] = [
    {
      id: WorkflowIdType.AddHids,
      title: 'HIDS',
      form: hidsForm
    },
    {
      id: WorkflowIdType.AddServerBackup,
      title: 'Server Backup',
      form: serverBackupForm
    }
  ];
}
