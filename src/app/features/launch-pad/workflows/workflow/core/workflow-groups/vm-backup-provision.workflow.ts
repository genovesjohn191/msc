import {
  ProductType,
  WorkflowType
} from '@app/models';
import { vmBackupProvisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VmBackupProvisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.VmBackupProvision,
    crispProductType: ProductType.VmBackup,
    title: 'Provision Virtual Machine Backup',
    form: vmBackupProvisionForm
  };
}