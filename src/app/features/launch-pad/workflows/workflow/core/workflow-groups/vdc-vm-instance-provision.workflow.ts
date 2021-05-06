import {
  ProductType,
  WorkflowType
} from '@app/models';
import { vdcVmInstanceProvisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VdcVmInstanceProvisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ManagedVmCreate,
    crispProductType: ProductType.VirtualDataCentreVmInstance,
    title: 'Provision Virtual Data Centre VM Instance',
    form: vdcVmInstanceProvisionForm
  };
}
