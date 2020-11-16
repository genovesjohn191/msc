import {
  ProductType,
  WorkflowType
} from '@app/models';
import { newVirtualMachineForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ProvisionVmWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ProvisionVirtualMachine,
    productType: ProductType.VirtualManagedServer,
    title: 'Provision Virtual Machine',
    form: newVirtualMachineForm
  };

  public children: WorkflowConfig[] = [];
}
