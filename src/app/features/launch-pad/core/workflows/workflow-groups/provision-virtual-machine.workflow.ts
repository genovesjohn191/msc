import {
  ProductType,
  WorkflowType
} from '@app/models';
import {
  provisionVirtualDataCentreVmInstanceForm,
  addOnHidsForm
} from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ProvisionVirtualDataCentreVmInstanceWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.CreateManagedVm,
    crispProductType: ProductType.VirtualDataCentreVmInstance,
    title: 'Provision Virtual Data Centre VM Instance',
    form: provisionVirtualDataCentreVmInstanceForm
  };

  public children: WorkflowConfig[] = [
    {
      id: WorkflowType.AddHids,
      crispProductType: ProductType.ServerHostIntrusionPreventionSystem,
      title: 'Add HIDS',
      form: addOnHidsForm
    }
  ];
}
