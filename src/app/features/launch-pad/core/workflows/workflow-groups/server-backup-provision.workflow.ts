import {
  ProductType,
  WorkflowType
} from '@app/models';
import { serverBackupProvisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ServerBackupProvisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ServerBackupProvision,
    crispProductType: ProductType.ServerBackup,
    title: 'Provision Server Backup',
    form: serverBackupProvisionForm
  };
}