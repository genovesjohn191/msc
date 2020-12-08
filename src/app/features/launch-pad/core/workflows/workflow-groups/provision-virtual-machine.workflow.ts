import {
  ProductType,
  WorkflowType
} from '@app/models';
import { provisionVirtualDataCentreVmInstanceForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ProvisionVirtualDataCentreVmInstanceWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.CreateManagedVm,
    crispProductType: ProductType.VirtualDataCentreVmInstance,
    title: 'Provision Virtual Data Centre VM Instance',
    form: provisionVirtualDataCentreVmInstanceForm
  };
}
