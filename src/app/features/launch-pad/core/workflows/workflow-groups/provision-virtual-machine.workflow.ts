import {
  ProductType,
  WorkflowType
} from '@app/models';
import { createVirtualMachineForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ProvisionVmWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.CreateManagedVm,
    productType: ProductType.VirtualManagedServer,
    title: 'Create Managed Virtual Machine',
    form: createVirtualMachineForm
  };

  public children: WorkflowConfig[] = [];
}
