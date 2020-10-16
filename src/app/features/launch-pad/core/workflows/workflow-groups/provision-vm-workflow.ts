import { ProductType, WorkflowType } from '@app/models';
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
    id: WorkflowType.ProvisionVm,
    productType: ProductType.VirtualManagedServer,
    title: 'Provision Virtual Machine',
    form: provisionVmForm
  };

  public children: WorkflowConfig[] = [
    {
      id: WorkflowType.AddHids,
      productType: ProductType.ServerHostIntrusionPreventionSystem,
      title: 'HIDS',
      form: hidsForm
    },
    {
      id: WorkflowType.AddServerBackup,
      productType: ProductType.VmBackup,
      title: 'Server Backup',
      form: serverBackupForm
    }
  ];
}
