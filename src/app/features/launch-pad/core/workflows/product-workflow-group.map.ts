import { ProductType } from '@app/models';
import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';

// Workflow: Assign workflow groups to product types
export const productWorkflowGroupMap: Map<ProductType, number[]> = new Map([
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
