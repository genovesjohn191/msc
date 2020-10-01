import { ProductType } from '@app/models';
import { WorkflowGroupId } from './workflow-group-type.enum';

// Workflow: Assign workflow groups to product types
export const productWorkflowGroupsMap: Map<ProductType, number[]> = new Map([
  [ ProductType.VirtualManagedServer,
    [
      WorkflowGroupId.ProvisionVm,
      WorkflowGroupId.ChangeVm,
      WorkflowGroupId.DeprovisionVm
    ]],
  [ ProductType.ServerAntiVirus,
    [
      WorkflowGroupId.AddAntiVirus
    ]],
]);
