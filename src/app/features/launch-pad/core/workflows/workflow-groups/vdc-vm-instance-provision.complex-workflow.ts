import {
  ProductType,
  WorkflowType
} from '@app/models';
import {
  hostSecurityProvisionHidsAddOnForm,
  serverBackupProvisionAddOnForm,
  vdcVmInstanceProvisionForm
} from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VdcVmInstanceProvisionComplexWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ManagedVmCreate,
    crispProductType: ProductType.VirtualDataCentreVmInstance,
    title: 'Provision Virtual Data Centre VM Instance',
    form: vdcVmInstanceProvisionForm
  };

  public children: WorkflowConfig[] = [
    {
      id: WorkflowType.HostSecurityProvisionHids,
      crispProductType: ProductType.ServerHostIntrusionPreventionSystem,
      title: 'Add HIDS',
      form: hostSecurityProvisionHidsAddOnForm
    },
    {
      id: WorkflowType.HostSecurityProvisionAntiVirus,
      crispProductType: ProductType.ServerAntiVirus,
      title: 'Add Anti-Virus',
      form: { config: [] }
    },
    {
      id: WorkflowType.ServerBackupProvision,
      crispProductType: ProductType.ServerBackup,
      title: 'Add Server Backup',
      form: serverBackupProvisionAddOnForm
    },
    {
      id: WorkflowType.VmBackupProvision,
      crispProductType: ProductType.VmBackup,
      title: 'Add VM Backup',
      form: serverBackupProvisionAddOnForm
    },
  ]
}
