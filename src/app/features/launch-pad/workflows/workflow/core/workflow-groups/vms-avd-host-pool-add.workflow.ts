import {
  ProductType,
  WorkflowType
} from '@app/models';
import { vmsAvdHostPoolAddForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VmsAvdHostPoolAddWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.VmsAvdHostPoolAdd,
    crispProductType: ProductType.AzureVirtualDesktop,
    title: 'Add VMs to AVD Host Pool',
    form: vmsAvdHostPoolAddForm
  };
}