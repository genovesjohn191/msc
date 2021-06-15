import {
  ProductType,
  WorkflowType
} from '@app/models';
import { managementToolsAddForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ManagementToolsAddWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ManagementToolsAdd,
    crispProductType: ProductType.VirtualDataCentreVmInstance,
    title: 'Add to Management Tools',
    form: managementToolsAddForm
  };
}