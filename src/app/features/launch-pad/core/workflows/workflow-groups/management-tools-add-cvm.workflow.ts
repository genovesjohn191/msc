import {
  ProductType,
  WorkflowType
} from '@app/models';
import { vdcVmInstanceAddToManagementToolsForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ManagementToolsAddCvmWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ManagementToolsAddCvm,
    crispProductType: ProductType.VirtualDataCentreVmInstance,
    title: 'Add CVM to Management Tools',
    form: vdcVmInstanceAddToManagementToolsForm
  };
}