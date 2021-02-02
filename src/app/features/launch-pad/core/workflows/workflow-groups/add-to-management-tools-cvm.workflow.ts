import { ProductType, WorkflowType } from '@app/models';
import { addToManagementToolsCvmForm } from '../forms/add-to-management-tools-cvm.form';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class AddToManagementToolsCvmWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ManagementToolsAddCvm,
    crispProductType: ProductType.VirtualDataCentreVmInstance,
    title: 'Add CVM to Management Tools',
    form: addToManagementToolsCvmForm
  };
}