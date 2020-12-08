import { ProductType, WorkflowType } from '@app/models';
import { addToManagementToolsForm } from '../forms/add-to-management-tools.form';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class AddToManagementToolsCvmWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.AddToManagementToolsCvm,
    crispProductType: ProductType.VirtualDataCentreVmInstance,
    title: 'Add CVM to Management Tools',
    form: addToManagementToolsForm
  };
}